package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type WeddingInfo struct {
	ID               string         `gorm:"type:char(36);primaryKey" json:"id"`
	OrderID          string         `gorm:"type:char(36);uniqueIndex;not null" json:"order_id"`
	GroomName        string         `gorm:"type:varchar(255)" json:"groom_name"`
	BrideName        string         `gorm:"type:varchar(255)" json:"bride_name"`
	GroomParent      string         `gorm:"type:varchar(500)" json:"groom_parent"`
	BrideParent      string         `gorm:"type:varchar(500)" json:"bride_parent"`
	GroomPhotoURL    string         `gorm:"type:varchar(500)" json:"groom_photo_url"`
	BridePhotoURL    string         `gorm:"type:varchar(500)" json:"bride_photo_url"`
	GroomAddress     string         `gorm:"type:varchar(500)" json:"groom_address"`
	BrideAddress     string         `gorm:"type:varchar(500)" json:"bride_address"`
	WeddingDate      *time.Time     `gorm:"type:date" json:"wedding_date"`
	LunarDate        string         `gorm:"type:varchar(50)" json:"lunar_date"`
	WeddingTime      string         `gorm:"type:varchar(20)" json:"wedding_time"`
	CeremonyTime     string         `gorm:"type:varchar(20)" json:"ceremony_time"`
	CeremonyVenue    string         `gorm:"type:varchar(500)" json:"ceremony_venue"`
	CeremonyAddress  string         `gorm:"type:varchar(500)" json:"ceremony_address"`
	CeremonyMapsURL  string         `gorm:"type:varchar(1000)" json:"ceremony_maps_url"`
	ReceptionVenue   string         `gorm:"type:varchar(500)" json:"reception_venue"`
	ReceptionTime    string         `gorm:"type:varchar(20)" json:"reception_time"`
	ReceptionAddress string         `gorm:"type:varchar(500)" json:"reception_address"`
	ReceptionMapsURL string         `gorm:"type:varchar(1000)" json:"reception_maps_url"`
	VenueAddress     string         `gorm:"type:varchar(500)" json:"venue_address"`
	MapsEmbedURL     string         `gorm:"type:varchar(1000)" json:"maps_embed_url"`
	EventDescription string         `gorm:"type:text" json:"event_description"`
	GalleryURLs      datatypes.JSON `gorm:"type:json" json:"gallery_urls"`
	GuestBookConfig  datatypes.JSON `gorm:"type:json" json:"guest_book_config"`
	RSVPConfig       datatypes.JSON `gorm:"type:json" json:"rsvp_config"`
	BankAccounts     datatypes.JSON `gorm:"type:json" json:"bank_accounts"`
	MusicURL         string         `gorm:"type:varchar(500)" json:"music_url"`
	ViewCount        uint           `gorm:"type:int unsigned;not null;default:0" json:"view_count"`
	VisibleSections  datatypes.JSON `gorm:"type:json" json:"visible_sections"`
	UpdatedAt        time.Time      `json:"updated_at"`
}

func (w *WeddingInfo) BeforeCreate(tx *gorm.DB) error {
	if w.ID == "" {
		w.ID = uuid.New().String()
	}
	return nil
}

func (WeddingInfo) TableName() string {
	return "wedding_info"
}
