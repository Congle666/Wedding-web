package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Coupon struct {
	ID        string     `gorm:"type:char(36);primaryKey" json:"id"`
	Code      string     `gorm:"type:varchar(50);uniqueIndex;not null" json:"code"`
	Type      string     `gorm:"type:enum('percent','fixed');not null;default:'percent'" json:"type"`
	Value     float64    `gorm:"type:decimal(10,2);not null" json:"value"`
	MinOrder  float64    `gorm:"type:decimal(10,0);not null;default:0" json:"min_order"`
	MaxUses   *int       `gorm:"type:int" json:"max_uses"`
	UsedCount int        `gorm:"not null;default:0" json:"used_count"`
	ExpiresAt *time.Time `gorm:"type:date" json:"expires_at"`
	IsActive  bool       `gorm:"type:tinyint(1);not null;default:1" json:"is_active"`
	CreatedAt time.Time  `json:"created_at"`
}

func (c *Coupon) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

func (Coupon) TableName() string {
	return "coupons"
}
