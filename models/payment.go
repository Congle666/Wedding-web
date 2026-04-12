package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Payment struct {
	ID              string         `gorm:"type:char(36);primaryKey" json:"id"`
	OrderID         string         `gorm:"type:char(36);not null" json:"order_id"`
	Provider        string         `gorm:"type:enum('vnpay','momo','zalopay','bank_transfer','cash');not null" json:"provider"`
	TransactionID   string         `gorm:"type:varchar(200)" json:"transaction_id"`
	Amount          float64        `gorm:"type:decimal(12,0);not null" json:"amount"`
	Currency        string         `gorm:"type:char(3);not null;default:'VND'" json:"currency"`
	Status          string         `gorm:"type:enum('pending','success','failed','refunded');not null;default:'pending'" json:"status"`
	Method          string         `gorm:"type:varchar(50)" json:"method"`
	GatewayResponse datatypes.JSON `gorm:"type:json" json:"gateway_response"`
	PaidAt          *time.Time     `json:"paid_at"`
	CreatedAt       time.Time      `json:"created_at"`
}

func (p *Payment) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

func (Payment) TableName() string {
	return "payments"
}
