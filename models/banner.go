package models

import "time"

type Banner struct {
	ID             uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	Title          string     `gorm:"type:varchar(200);not null" json:"title"`
	ImageURL       string     `gorm:"type:varchar(500);not null" json:"image_url"`
	ImageMobileURL string     `gorm:"type:varchar(500)" json:"image_mobile_url"`
	LinkURL        string     `gorm:"type:varchar(500)" json:"link_url"`
	LinkTarget     string     `gorm:"type:enum('_self','_blank');not null;default:'_self'" json:"link_target"`
	Position       string     `gorm:"type:enum('home_top','home_middle','home_bottom','template_list','checkout','popup');not null;default:'home_top'" json:"position"`
	SortOrder      int        `gorm:"not null;default:0" json:"sort_order"`
	IsActive       bool       `gorm:"type:tinyint(1);not null;default:1" json:"is_active"`
	StartedAt      *time.Time `json:"started_at"`
	EndedAt        *time.Time `json:"ended_at"`
	ClickCount     uint       `gorm:"type:int unsigned;not null;default:0" json:"click_count"`
	ViewCount      uint       `gorm:"type:int unsigned;not null;default:0" json:"view_count"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

func (Banner) TableName() string {
	return "banners"
}
