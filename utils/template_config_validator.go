package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"wedding-api/models"

	"gorm.io/datatypes"
)

// MaxTemplateConfigBytes caps the raw JSON size of templates.customizable_fields
// to prevent abuse / accidental bloat. 64 KiB is generous for slot + color config.
// MaxTemplateConfigBytes caps the raw JSON size. 256KB for v2.0 blocks
// (each block carries positioned elements); 64KB was v1.0 limit.
const MaxTemplateConfigBytes = 256 * 1024

// allowedAssetURLPrefixes lists the valid prefixes for any asset URL string
// found inside TemplateConfig.Assets. Prevents SSRF / external-host injection.
var allowedAssetURLPrefixes = []string{
	"/uploads/",
	"/themes/",
	"http://localhost",  // dev static serving fallback
	"https://localhost", // dev
}

// ValidateTemplateConfigJSON validates the raw JSON stored in
// templates.customizable_fields. Returns nil when the field is null/empty
// (backward compatible with legacy templates that never set a config).
//
// Rules:
//   - Empty / nil → OK (legacy).
//   - Must be valid JSON object (not array / primitive).
//   - Size ≤ MaxTemplateConfigBytes.
//   - `version` (if present) must be in allow-list.
//   - `base_theme` (if present) must be in allow-list.
//   - Any asset URL must start with an allowed prefix.
func ValidateTemplateConfigJSON(raw datatypes.JSON) error {
	if len(raw) == 0 || string(raw) == "null" {
		return nil
	}
	if len(raw) > MaxTemplateConfigBytes {
		return fmt.Errorf("template_config exceeds %d bytes", MaxTemplateConfigBytes)
	}

	// Must decode to object first (reject arrays/primitives).
	var asObject map[string]json.RawMessage
	if err := json.Unmarshal(raw, &asObject); err != nil {
		return errors.New("template_config must be a JSON object")
	}

	// Detect version and route to the appropriate validation branch.
	version := ""
	if v, ok := asObject["version"]; ok {
		var vs string
		if err := json.Unmarshal(v, &vs); err == nil {
			version = vs
		}
	}

	if version != "" && !models.AllowedTemplateConfigVersions[version] {
		return fmt.Errorf("unsupported template_config version: %s", version)
	}

	// v2.0 → BuilderConfig validation
	if version == "2.0" {
		return validateBuilderConfigV2([]byte(raw))
	}

	// v1.0 or legacy (no version) → TemplateConfig validation
	var cfg models.TemplateConfig
	if err := json.Unmarshal(raw, &cfg); err != nil {
		return fmt.Errorf("template_config shape error: %w", err)
	}

	if cfg.BaseTheme != "" && !models.AllowedTemplateConfigBaseThemes[cfg.BaseTheme] {
		return fmt.Errorf("unsupported template_config base_theme: %s", cfg.BaseTheme)
	}

	// Walk all asset URL strings and enforce prefix allow-list.
	for section, slots := range cfg.Assets {
		for slotKey, val := range slots {
			switch v := val.(type) {
			case string:
				if v == "" {
					continue
				}
				if !hasAllowedAssetPrefix(v) {
					return fmt.Errorf("asset %s.%s has disallowed URL: %s", section, slotKey, v)
				}
			case []any:
				for i, item := range v {
					s, ok := item.(string)
					if !ok {
						return fmt.Errorf("asset %s.%s[%d] must be a string URL", section, slotKey, i)
					}
					if s == "" {
						continue
					}
					if !hasAllowedAssetPrefix(s) {
						return fmt.Errorf("asset %s.%s[%d] has disallowed URL: %s", section, slotKey, i, s)
					}
				}
			default:
				return fmt.Errorf("asset %s.%s must be string or string array", section, slotKey)
			}
		}
	}

	return nil
}

// validateBuilderConfigV2 validates a v2.0 BuilderConfig JSON.
func validateBuilderConfigV2(raw json.RawMessage) error {
	var cfg models.BuilderConfig
	if err := json.Unmarshal(raw, &cfg); err != nil {
		return fmt.Errorf("builder_config v2.0 shape error: %w", err)
	}

	if len(cfg.Blocks) > models.MaxBlocksPerConfig {
		return fmt.Errorf("too many blocks: %d (max %d)", len(cfg.Blocks), models.MaxBlocksPerConfig)
	}

	for i, block := range cfg.Blocks {
		if !models.AllowedBlockTypes[block.BlockType] {
			return fmt.Errorf("block[%d] has unsupported type: %s", i, block.BlockType)
		}
		if len(block.Elements) > models.MaxElementsPerBlock {
			return fmt.Errorf("block[%d] has too many elements: %d (max %d)",
				i, len(block.Elements), models.MaxElementsPerBlock)
		}
		for j, el := range block.Elements {
			if !models.AllowedElementTypes[el.Type] {
				return fmt.Errorf("block[%d].element[%d] has unsupported type: %s", i, j, el.Type)
			}
			if !models.AllowedAnimationTypes[el.Animation.Type] {
				return fmt.Errorf("block[%d].element[%d] has unsupported animation: %s", i, j, el.Animation.Type)
			}
			// Validate image URLs
			if el.Type == "image" && el.Content != "" {
				if !hasAllowedAssetPrefix(el.Content) {
					return fmt.Errorf("block[%d].element[%d] has disallowed URL: %s", i, j, el.Content)
				}
			}
		}
	}

	return nil
}

func hasAllowedAssetPrefix(s string) bool {
	for _, p := range allowedAssetURLPrefixes {
		if strings.HasPrefix(s, p) {
			return true
		}
	}
	return false
}
