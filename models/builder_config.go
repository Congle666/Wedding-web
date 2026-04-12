package models

// BuilderConfig v2.0 — composable blocks with positionable elements.
// Keep in sync with:
//   - wedding-admin/src/types/builderConfig.ts
//   - wedding-web/types/builderConfig.ts

type BuilderConfig struct {
	Version      string          `json:"version"`
	Blocks       []BlockInstance `json:"blocks"`
	GlobalStyles GlobalStyles    `json:"global_styles"`
}

type BlockInstance struct {
	ID        string            `json:"id"`
	BlockType string            `json:"block_type"`
	Visible   bool              `json:"visible"`
	Elements  []ElementInstance `json:"elements"`
	Settings  map[string]any    `json:"settings"`
}

type ElementInstance struct {
	ID        string           `json:"id"`
	Type      string           `json:"type"`
	Position  ElementPosition  `json:"position"`
	Style     ElementStyle     `json:"style"`
	Animation ElementAnimation `json:"animation"`
	Content   string           `json:"content"`
	Locked    bool             `json:"locked"`
	Category  string           `json:"category,omitempty"`
}

type ElementPosition struct {
	X      float64 `json:"x"`
	Y      float64 `json:"y"`
	Width  float64 `json:"width"`
	Height float64 `json:"height"`
}

type ElementStyle struct {
	Opacity    float64 `json:"opacity"`
	ZIndex     int     `json:"z_index"`
	Rotation   float64 `json:"rotation"`
	FlipX      bool    `json:"flip_x"`
	Color      string  `json:"color,omitempty"`
	FontSize   int     `json:"font_size,omitempty"`
	FontFamily string  `json:"font_family,omitempty"`
	FontWeight int     `json:"font_weight,omitempty"`
	FontStyle  string  `json:"font_style,omitempty"`
}

type ElementAnimation struct {
	Type          string  `json:"type"`
	Duration      int     `json:"duration"`
	Delay         int     `json:"delay"`
	TriggerOn     string  `json:"trigger_on"`
	ParallaxSpeed float64 `json:"parallax_speed,omitempty"`
}

type GlobalStyles struct {
	Colors   TemplateColors `json:"colors"`
	Fonts    TemplateFonts  `json:"fonts"`
	PaperBg  string         `json:"paper_bg,omitempty"`
	MusicUrl string         `json:"music_url,omitempty"`
}

// Limits for v2.0 validation.
const (
	MaxBlocksPerConfig  = 20
	MaxElementsPerBlock = 50
)

var AllowedBlockTypes = map[string]bool{
	"cover-songphung":   true,
	"hero-songphung":    true,
	"family-default":    true,
	"ceremony-default":  true,
	"countdown-default": true,
	"gallery-default":   true,
	"wishes-default":    true,
	"bank-default":      true,
	"footer-default":    true,
}

var AllowedElementTypes = map[string]bool{
	"image":   true,
	"text":    true,
	"shape":   true,
	"divider": true,
}

var AllowedAnimationTypes = map[string]bool{
	"none":         true,
	"fadeIn":        true,
	"fadeInUp":      true,
	"slideInLeft":   true,
	"slideInRight":  true,
	"scaleIn":       true,
	"parallax":      true,
}
