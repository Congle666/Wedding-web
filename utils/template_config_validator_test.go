package utils

import (
	"encoding/json"
	"fmt"
	"strings"
	"testing"

	"wedding-api/models"

	"gorm.io/datatypes"
)

func mustJSON(t *testing.T, v any) datatypes.JSON {
	t.Helper()
	b, err := json.Marshal(v)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	return datatypes.JSON(b)
}

func TestValidateTemplateConfigJSON_NilAndEmptyOK(t *testing.T) {
	if err := ValidateTemplateConfigJSON(nil); err != nil {
		t.Errorf("nil should be valid (legacy), got: %v", err)
	}
	if err := ValidateTemplateConfigJSON(datatypes.JSON("")); err != nil {
		t.Errorf("empty should be valid, got: %v", err)
	}
	if err := ValidateTemplateConfigJSON(datatypes.JSON("null")); err != nil {
		t.Errorf("literal null should be valid, got: %v", err)
	}
}

func TestValidateTemplateConfigJSON_DefaultConfigOK(t *testing.T) {
	cfg := models.DefaultSongPhungRedConfig()
	if err := ValidateTemplateConfigJSON(mustJSON(t, cfg)); err != nil {
		t.Errorf("default config must validate, got: %v", err)
	}
}

func TestValidateTemplateConfigJSON_RejectsNonObject(t *testing.T) {
	cases := []string{`[1,2,3]`, `"hello"`, `123`, `true`}
	for _, raw := range cases {
		if err := ValidateTemplateConfigJSON(datatypes.JSON(raw)); err == nil {
			t.Errorf("%s should be rejected", raw)
		}
	}
}

func TestValidateTemplateConfigJSON_RejectsOverSize(t *testing.T) {
	// Build a >64KB payload by inflating a harmless field.
	big := strings.Repeat("x", MaxTemplateConfigBytes+10)
	raw := `{"version":"1.0","base_theme":"songphung-red","colors":{"primary":"` + big + `"}}`
	if err := ValidateTemplateConfigJSON(datatypes.JSON(raw)); err == nil {
		t.Error("oversize payload should be rejected")
	}
}

func TestValidateTemplateConfigJSON_RejectsBadVersion(t *testing.T) {
	raw := `{"version":"9.9","base_theme":"songphung-red"}`
	if err := ValidateTemplateConfigJSON(datatypes.JSON(raw)); err == nil {
		t.Error("bad version should be rejected")
	}
}

func TestValidateTemplateConfigJSON_RejectsBadBaseTheme(t *testing.T) {
	raw := `{"version":"1.0","base_theme":"evil-theme"}`
	if err := ValidateTemplateConfigJSON(datatypes.JSON(raw)); err == nil {
		t.Error("bad base_theme should be rejected")
	}
}

func TestValidateTemplateConfigJSON_RejectsExternalURL(t *testing.T) {
	raw := `{"version":"1.0","base_theme":"songphung-red","assets":{"cover":{"phoenix_left":"https://evil.example.com/x.jpg"}}}`
	if err := ValidateTemplateConfigJSON(datatypes.JSON(raw)); err == nil {
		t.Error("external asset URL should be rejected")
	}
}

func TestValidateTemplateConfigJSON_AcceptsUploadsPrefix(t *testing.T) {
	raw := `{"version":"1.0","base_theme":"songphung-red","assets":{"cover":{"phoenix_left":"/uploads/abc123.webp"}}}`
	if err := ValidateTemplateConfigJSON(datatypes.JSON(raw)); err != nil {
		t.Errorf("/uploads/ prefix should be valid, got: %v", err)
	}
}

func TestValidateTemplateConfigJSON_AcceptsThemesPrefix(t *testing.T) {
	raw := `{"version":"1.0","base_theme":"songphung-red","assets":{"cover":{"phoenix_left":"/themes/songphung-red/phoenix.webp"}}}`
	if err := ValidateTemplateConfigJSON(datatypes.JSON(raw)); err != nil {
		t.Errorf("/themes/ prefix should be valid, got: %v", err)
	}
}

func TestValidateTemplateConfigJSON_GalleryArrayURLs(t *testing.T) {
	raw := `{"version":"1.0","base_theme":"songphung-red","assets":{"gallery":{"images":["/uploads/1.jpg","/uploads/2.jpg"]}}}`
	if err := ValidateTemplateConfigJSON(datatypes.JSON(raw)); err != nil {
		t.Errorf("valid gallery array should pass, got: %v", err)
	}

	bad := `{"version":"1.0","base_theme":"songphung-red","assets":{"gallery":{"images":["/uploads/ok.jpg","https://evil.com/x.jpg"]}}}`
	if err := ValidateTemplateConfigJSON(datatypes.JSON(bad)); err == nil {
		t.Error("gallery with external url should be rejected")
	}
}

// ─── v2.0 BuilderConfig tests ───

func TestValidateV2_ValidConfig(t *testing.T) {
	raw := `{
		"version":"2.0",
		"blocks":[{
			"id":"b1","block_type":"cover-songphung","visible":true,
			"elements":[{
				"id":"e1","type":"image",
				"position":{"x":10,"y":20,"width":30,"height":0},
				"style":{"opacity":1,"z_index":1,"rotation":0,"flip_x":false},
				"animation":{"type":"fadeIn","duration":600,"delay":0,"trigger_on":"scroll"},
				"content":"/themes/songphung-red/phoenix.webp",
				"locked":false
			}],
			"settings":{}
		}],
		"global_styles":{"colors":{"primary":"#5F191D","background":"#F8F2ED","text":"#2C1810","accent":"#C8963C"},"fonts":{"heading":"Cormorant Garamond","body":"Be Vietnam Pro"}}
	}`
	if err := ValidateTemplateConfigJSON(datatypes.JSON(raw)); err != nil {
		t.Errorf("valid v2.0 config should pass, got: %v", err)
	}
}

func TestValidateV2_RejectsBadBlockType(t *testing.T) {
	raw := `{"version":"2.0","blocks":[{"id":"b1","block_type":"evil-block","visible":true,"elements":[],"settings":{}}],"global_styles":{"colors":{},"fonts":{}}}`
	if err := ValidateTemplateConfigJSON(datatypes.JSON(raw)); err == nil {
		t.Error("bad block_type should be rejected")
	}
}

func TestValidateV2_RejectsBadElementType(t *testing.T) {
	raw := `{"version":"2.0","blocks":[{"id":"b1","block_type":"cover-songphung","visible":true,"elements":[{"id":"e1","type":"script","position":{"x":0,"y":0,"width":0,"height":0},"style":{"opacity":1,"z_index":0,"rotation":0,"flip_x":false},"animation":{"type":"none","duration":0,"delay":0,"trigger_on":"load"},"content":"","locked":false}],"settings":{}}],"global_styles":{"colors":{},"fonts":{}}}`
	if err := ValidateTemplateConfigJSON(datatypes.JSON(raw)); err == nil {
		t.Error("bad element type should be rejected")
	}
}

func TestValidateV2_RejectsExternalURL(t *testing.T) {
	raw := `{"version":"2.0","blocks":[{"id":"b1","block_type":"cover-songphung","visible":true,"elements":[{"id":"e1","type":"image","position":{"x":0,"y":0,"width":0,"height":0},"style":{"opacity":1,"z_index":0,"rotation":0,"flip_x":false},"animation":{"type":"none","duration":0,"delay":0,"trigger_on":"load"},"content":"https://evil.com/x.jpg","locked":false}],"settings":{}}],"global_styles":{"colors":{},"fonts":{}}}`
	if err := ValidateTemplateConfigJSON(datatypes.JSON(raw)); err == nil {
		t.Error("external URL in v2 element should be rejected")
	}
}

func TestValidateV2_TooManyBlocks(t *testing.T) {
	blocks := ""
	for i := 0; i < 25; i++ {
		if i > 0 {
			blocks += ","
		}
		blocks += `{"id":"b` + fmt.Sprintf("%d", i) + `","block_type":"cover-songphung","visible":true,"elements":[],"settings":{}}`
	}
	raw := `{"version":"2.0","blocks":[` + blocks + `],"global_styles":{"colors":{},"fonts":{}}}`
	if err := ValidateTemplateConfigJSON(datatypes.JSON(raw)); err == nil {
		t.Error("25 blocks should exceed limit of 20")
	}
}

func TestValidateV2_EmptyBlocksOK(t *testing.T) {
	raw := `{"version":"2.0","blocks":[],"global_styles":{"colors":{"primary":"#000"},"fonts":{"heading":"Arial","body":"Arial"}}}`
	if err := ValidateTemplateConfigJSON(datatypes.JSON(raw)); err != nil {
		t.Errorf("empty blocks should be valid, got: %v", err)
	}
}

func TestDefaultSongPhungRedConfig_RoundTrip(t *testing.T) {
	cfg := models.DefaultSongPhungRedConfig()
	raw, err := json.Marshal(cfg)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	var back models.TemplateConfig
	if err := json.Unmarshal(raw, &back); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if back.Version != "1.0" || back.BaseTheme != "songphung-red" {
		t.Errorf("round-trip lost fields: %+v", back)
	}
	if back.Colors.Primary != "#5F191D" {
		t.Errorf("primary color lost: %s", back.Colors.Primary)
	}
	if back.Sections["cover"].Order != 1 {
		t.Errorf("cover order lost: %+v", back.Sections["cover"])
	}
}
