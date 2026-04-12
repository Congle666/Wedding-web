package models

import "time"

type WeddingPageView struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID   string    `gorm:"type:char(36);not null" json:"order_id"`
	IPHash    string    `gorm:"type:varchar(64)" json:"ip_hash"`
	UserAgent string    `gorm:"type:varchar(500)" json:"user_agent"`
	Referer   string    `gorm:"type:varchar(500)" json:"referer"`
	GuestSlug string    `gorm:"type:varchar(100)" json:"guest_slug"`
	ViewedAt  time.Time `gorm:"autoCreateTime" json:"viewed_at"`
}

func (WeddingPageView) TableName() string {
	return "wedding_page_views"
}
