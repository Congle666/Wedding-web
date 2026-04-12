package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type TemplateCategory struct {
	ID           uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Name         string `gorm:"type:varchar(100);not null" json:"name"`
	Slug         string `gorm:"type:varchar(120);uniqueIndex;not null" json:"slug"`
	Description  string `gorm:"type:text" json:"description"`
	ThumbnailURL string `gorm:"type:varchar(500)" json:"thumbnail_url"`
	SortOrder    int    `gorm:"not null;default:0" json:"sort_order"`
	IsActive     bool   `gorm:"type:tinyint(1);not null;default:1" json:"is_active"`
}

func (TemplateCategory) TableName() string {
	return "template_categories"
}

type Template struct {
	ID                 string           `gorm:"type:char(36);primaryKey" json:"id"`
	CategoryID         uint             `gorm:"column:category_id;type:int unsigned;not null" json:"category_id"`
	Category           TemplateCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Name               string           `gorm:"type:varchar(150);not null" json:"name"`
	Slug               string           `gorm:"type:varchar(180);uniqueIndex;not null" json:"slug"`
	ThumbnailURL       string           `gorm:"type:varchar(500)" json:"thumbnail_url"`
	PreviewImages      datatypes.JSON   `gorm:"type:json" json:"preview_images"`
	PricePerDay        float64          `gorm:"type:decimal(10,0);not null;default:0" json:"price_per_day"`
	PricePerMonth      float64          `gorm:"type:decimal(10,0);not null;default:0" json:"price_per_month"`
	CustomizableFields datatypes.JSON   `gorm:"type:json" json:"customizable_fields"`
	Description        string           `gorm:"type:text" json:"description"`
	HtmlContent        string           `gorm:"type:longtext" json:"html_content,omitempty"`
	ThemeSlug          string           `gorm:"type:varchar(100);default:'songphung-red'" json:"theme_slug"`
	IsFree             bool             `gorm:"type:tinyint(1);not null;default:0" json:"is_free"`
	HasVideo           bool             `gorm:"type:tinyint(1);not null;default:0" json:"has_video"`
	IsActive           bool             `gorm:"type:tinyint(1);not null;default:1" json:"is_active"`
	ViewCount          uint             `gorm:"type:int unsigned;not null;default:0" json:"view_count"`
	CreatedAt          time.Time        `json:"created_at"`
	UpdatedAt          time.Time        `json:"updated_at"`
}

func (t *Template) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		t.ID = uuid.New().String()
	}
	return nil
}

func (Template) TableName() string {
	return "templates"
}
