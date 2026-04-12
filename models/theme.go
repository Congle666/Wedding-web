package models

import "time"

type Theme struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name         string    `gorm:"type:varchar(100);not null" json:"name"`
	Slug         string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"slug"`
	Description  string    `gorm:"type:text" json:"description"`
	ThumbnailURL string    `gorm:"type:varchar(500)" json:"thumbnail_url"`
	IsActive     bool      `gorm:"type:tinyint(1);not null;default:1" json:"is_active"`
	SortOrder    int       `gorm:"not null;default:0" json:"sort_order"`
	CreatedAt    time.Time `json:"created_at"`
}

func (Theme) TableName() string {
	return "themes"
}
