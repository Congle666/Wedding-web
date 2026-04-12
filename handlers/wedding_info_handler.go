package handlers

import (
	"fmt"
	"net/http"
	"time"

	"wedding-api/config"
	"wedding-api/models"
	"wedding-api/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
)

type UpdateWeddingInfoInput struct {
	GroomName        string         `json:"groom_name"`
	BrideName        string         `json:"bride_name"`
	GroomParent      string         `json:"groom_parent"`
	BrideParent      string         `json:"bride_parent"`
	GroomPhotoURL    string         `json:"groom_photo_url"`
	BridePhotoURL    string         `json:"bride_photo_url"`
	GroomAddress     string         `json:"groom_address"`
	BrideAddress     string         `json:"bride_address"`
	WeddingDate      string         `json:"wedding_date"`
	LunarDate        string         `json:"lunar_date"`
	WeddingTime      string         `json:"wedding_time"`
	CeremonyTime     string         `json:"ceremony_time"`
	CeremonyVenue    string         `json:"ceremony_venue"`
	CeremonyAddress  string         `json:"ceremony_address"`
	CeremonyMapsURL  string         `json:"ceremony_maps_url"`
	ReceptionVenue   string         `json:"reception_venue"`
	ReceptionTime    string         `json:"reception_time"`
	ReceptionAddress string         `json:"reception_address"`
	ReceptionMapsURL string         `json:"reception_maps_url"`
	VenueAddress     string         `json:"venue_address"`
	MapsEmbedURL     string         `json:"maps_embed_url"`
	EventDescription string         `json:"event_description"`
	GalleryURLs      datatypes.JSON `json:"gallery_urls"`
	GuestBookConfig  datatypes.JSON `json:"guest_book_config"`
	RSVPConfig       datatypes.JSON `json:"rsvp_config"`
	BankAccounts     datatypes.JSON `json:"bank_accounts"`
	MusicURL         string         `json:"music_url"`
	VisibleSections  datatypes.JSON `json:"visible_sections"`
}

func GetWeddingInfo(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")
	orderID := c.Param("id")

	var order models.Order
	query := config.DB.Where("id = ?", orderID)
	if userRole != "admin" {
		query = query.Where("user_id = ?", userID)
	}
	if err := query.First(&order).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Order not found")
		return
	}

	var weddingInfo models.WeddingInfo
	if err := config.DB.Where("order_id = ?", orderID).First(&weddingInfo).Error; err != nil {
		utils.SuccessResponse(c, http.StatusOK, "", nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "", weddingInfo)
}

func UpdateWeddingInfo(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")
	orderID := c.Param("id")

	var order models.Order
	query := config.DB.Where("id = ?", orderID)
	if userRole != "admin" {
		query = query.Where("user_id = ?", userID)
	}
	if err := query.First(&order).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Order not found")
		return
	}

	var input UpdateWeddingInfoInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	var weddingInfo models.WeddingInfo
	result := config.DB.Where("order_id = ?", orderID).First(&weddingInfo)
	isNew := result.RowsAffected == 0

	if isNew {
		weddingInfo = models.WeddingInfo{
			OrderID: orderID,
		}
	}

	weddingInfo.GroomName = input.GroomName
	weddingInfo.BrideName = input.BrideName
	weddingInfo.GroomParent = input.GroomParent
	weddingInfo.BrideParent = input.BrideParent
	weddingInfo.GroomPhotoURL = input.GroomPhotoURL
	weddingInfo.BridePhotoURL = input.BridePhotoURL
	weddingInfo.GroomAddress = input.GroomAddress
	weddingInfo.BrideAddress = input.BrideAddress
	weddingInfo.LunarDate = input.LunarDate
	weddingInfo.WeddingTime = input.WeddingTime
	weddingInfo.CeremonyTime = input.CeremonyTime
	weddingInfo.CeremonyVenue = input.CeremonyVenue
	weddingInfo.CeremonyAddress = input.CeremonyAddress
	weddingInfo.CeremonyMapsURL = input.CeremonyMapsURL
	weddingInfo.ReceptionVenue = input.ReceptionVenue
	weddingInfo.ReceptionTime = input.ReceptionTime
	weddingInfo.ReceptionAddress = input.ReceptionAddress
	weddingInfo.ReceptionMapsURL = input.ReceptionMapsURL
	weddingInfo.VenueAddress = input.VenueAddress
	weddingInfo.MapsEmbedURL = input.MapsEmbedURL
	weddingInfo.EventDescription = input.EventDescription
	weddingInfo.MusicURL = input.MusicURL

	if input.WeddingDate != "" {
		t, err := time.Parse("2006-01-02", input.WeddingDate)
		if err == nil {
			weddingInfo.WeddingDate = &t
		}
	}
	if input.GalleryURLs != nil {
		weddingInfo.GalleryURLs = input.GalleryURLs
	}
	if input.GuestBookConfig != nil {
		weddingInfo.GuestBookConfig = input.GuestBookConfig
	}
	if input.RSVPConfig != nil {
		weddingInfo.RSVPConfig = input.RSVPConfig
	}
	if input.BankAccounts != nil {
		weddingInfo.BankAccounts = input.BankAccounts
	}
	if input.VisibleSections != nil {
		weddingInfo.VisibleSections = input.VisibleSections
	}

	if isNew {
		config.DB.Create(&weddingInfo)
	} else {
		config.DB.Save(&weddingInfo)
	}

	utils.SuccessResponse(c, http.StatusOK, "Wedding info updated", weddingInfo)
}

func PublishWedding(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")
	orderID := c.Param("id")

	var order models.Order
	query := config.DB.Where("id = ?", orderID)
	if userRole != "admin" {
		query = query.Where("user_id = ?", userID)
	}
	if err := query.First(&order).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Order not found")
		return
	}

	if order.Status != "paid" {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid_status", "Order must be paid before publishing")
		return
	}

	var weddingInfo models.WeddingInfo
	if err := config.DB.Where("order_id = ?", orderID).First(&weddingInfo).Error; err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "no_wedding_info", "Please fill in wedding info before publishing")
		return
	}

	publishedURL := fmt.Sprintf("/wedding/%s", order.ID)
	if order.CustomDomain != "" {
		publishedURL = order.CustomDomain
	}

	config.DB.Model(&order).Updates(map[string]interface{}{
		"status":        "published",
		"published_url": publishedURL,
	})

	order.Status = "published"
	order.PublishedURL = publishedURL

	utils.SuccessResponse(c, http.StatusOK, "Wedding published", order)
}
