package models

// TemplateConfig is the canonical schema persisted in templates.customizable_fields.
// Keep in sync with:
//   - wedding-admin/src/types/templateConfig.ts
//   - wedding-web/types/templateConfig.ts
//
// Storage stays datatypes.JSON on the Template model; this struct is used only
// for validation + default helpers.
type TemplateConfig struct {
	Version     string                       `json:"version"`
	BaseTheme   string                       `json:"base_theme"`
	Colors      TemplateColors               `json:"colors"`
	Fonts       TemplateFonts                `json:"fonts"`
	Assets      map[string]map[string]any    `json:"assets"`
	TextSamples map[string]map[string]string `json:"text_samples"`
	Sections    map[string]TemplateSection   `json:"sections"`
}

type TemplateColors struct {
	Primary    string `json:"primary"`
	Background string `json:"background"`
	Text       string `json:"text"`
	Accent     string `json:"accent"`
}

type TemplateFonts struct {
	Heading string `json:"heading"`
	Body    string `json:"body"`
}

type TemplateSection struct {
	Visible bool `json:"visible"`
	Order   int  `json:"order"`
}

// Allow-lists for validator.
var (
	AllowedTemplateConfigVersions = map[string]bool{
		"1.0": true,
		"2.0": true,
	}
	AllowedTemplateConfigBaseThemes = map[string]bool{
		"songphung-red": true,
	}
)

// DefaultSongPhungRedConfig returns the canonical default config matching the
// hardcoded songphung-red theme values. Used for seeding + tests.
func DefaultSongPhungRedConfig() TemplateConfig {
	return TemplateConfig{
		Version:   "1.0",
		BaseTheme: "songphung-red",
		Colors: TemplateColors{
			Primary:    "#5F191D",
			Background: "#F8F2ED",
			Text:       "#2C1810",
			Accent:     "#C8963C",
		},
		Fonts: TemplateFonts{
			Heading: "Cormorant Garamond",
			Body:    "Be Vietnam Pro",
		},
		Assets: map[string]map[string]any{
			"cover": {
				"phoenix_left":  "/themes/songphung-red/phoenix.webp",
				"phoenix_right": "/themes/songphung-red/phoenix2.webp",
				"flower_tl":     "/themes/songphung-red/flower.webp",
				"flower_br":     "/themes/songphung-red/flower.webp",
				"chu_hy":        "/themes/songphung-red/chu-hy.webp",
				"paper_bg":      "/themes/songphung-red/paper-bg.jpg",
			},
			"hero": {
				"phoenix_left":  "/themes/songphung-red/phoenix.webp",
				"phoenix_right": "/themes/songphung-red/phoenix2.webp",
				"chu_hy":        "/themes/songphung-red/chu-hy.webp",
			},
			"family": {
				"flower": "/themes/songphung-red/flower.webp",
			},
			"global": {
				"music_url": "/themes/songphung-red/music.mp3",
			},
		},
		TextSamples: map[string]map[string]string{
			"cover": {
				"button_label":         "Mở thiệp mời",
				"invitation_greeting":  "Trân trọng kính mời",
				"invitation_subtext":   "Đến dự lễ thành hôn của chúng tôi",
			},
			"hero":     {"subtitle": "Save the date"},
			"family":   {"section_title": "Thành hôn"},
			"ceremony": {"section_title": "Lễ cưới"},
			"gallery":  {"section_title": "Khoảnh khắc"},
			"wishes":   {"section_title": "Sổ lưu bút"},
			"bank":     {"section_title": "Hộp mừng cưới"},
		},
		Sections: map[string]TemplateSection{
			"cover":     {Visible: true, Order: 1},
			"hero":      {Visible: true, Order: 2},
			"family":    {Visible: true, Order: 3},
			"ceremony":  {Visible: true, Order: 4},
			"countdown": {Visible: true, Order: 5},
			"gallery":   {Visible: true, Order: 6},
			"wishes":    {Visible: true, Order: 7},
			"bank":      {Visible: true, Order: 8},
			"footer":    {Visible: true, Order: 9},
		},
	}
}
