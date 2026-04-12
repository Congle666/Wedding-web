package models

import (
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type OrderItem struct {
	ID             string         `gorm:"type:char(36);primaryKey" json:"id"`
	OrderID        string         `gorm:"type:char(36);not null" json:"order_id"`
	TemplateID     string         `gorm:"type:char(36);not null" json:"template_id"`
	Template       Template       `gorm:"foreignKey:TemplateID" json:"template,omitempty"`
	PriceSnapshot  float64        `gorm:"type:decimal(12,0);not null" json:"price_snapshot"`
	ConfigSnapshot datatypes.JSON `gorm:"type:json" json:"config_snapshot"`
}

func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
	if oi.ID == "" {
		oi.ID = uuid.New().String()
	}
	return nil
}

func (OrderItem) TableName() string {
	return "order_items"
}
