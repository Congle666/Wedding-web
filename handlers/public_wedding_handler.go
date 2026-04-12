package handlers

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"net/http"

	"wedding-api/config"
	"wedding-api/models"
	"wedding-api/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetPublicWeddingData returns all data needed to render a wedding page
// GET /api/wedding/:slug — public, no auth needed
func GetPublicWeddingData(c *gin.Context) {
	slug := c.Param("slug")

	// Find order by custom_domain
	var order models.Order
	err := config.DB.
		Preload("OrderItems").
		Where("(custom_domain = ? OR published_url = ?) AND status = 'published'", slug, slug).
		First(&order).Error
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy thiệp cưới")
		return
	}

	// Get template
	var tmpl models.Template
	if len(order.OrderItems) > 0 {
		config.DB.Preload("Category").First(&tmpl, "id = ?", order.OrderItems[0].TemplateID)
	}

	// Get wedding info
	var weddingInfo models.WeddingInfo
	config.DB.Where("order_id = ?", order.ID).First(&weddingInfo)

	// Guest personalization: read ?guest=slug from query
	guestSlug := c.Query("guest")
	var guestName string
	if guestSlug != "" {
		var guest models.Guest
		if err := config.DB.Where("order_id = ? AND slug = ? AND is_active = ?",
			order.ID, guestSlug, true).First(&guest).Error; err == nil {
			guestName = guest.Name
		}
	}

	// Get wishes
	var wishes []models.GuestWish
	config.DB.Where("order_id = ?", order.ID).Order("created_at DESC").Limit(50).Find(&wishes)

	// Get RSVP count
	var rsvpCount int64
	config.DB.Model(&models.RSVPResponse{}).Where("order_id = ? AND attending = ?", order.ID, true).Count(&rsvpCount)

	// Parse bank accounts
	var bankAccounts []map[string]string
	if weddingInfo.BankAccounts != nil {
		json.Unmarshal(weddingInfo.BankAccounts, &bankAccounts)
	}

	// Parse gallery
	var galleryURLs []string
	if weddingInfo.GalleryURLs != nil {
		json.Unmarshal(weddingInfo.GalleryURLs, &galleryURLs)
	}

	// Parse visible sections
	var visibleSections map[string]bool
	if weddingInfo.VisibleSections != nil {
		json.Unmarshal(weddingInfo.VisibleSections, &visibleSections)
	}

	// Parse template_config from the template's customizable_fields JSON.
	// null/empty → omitted from response; theme will fall back to hardcoded defaults.
	var templateConfig map[string]interface{}
	if len(tmpl.CustomizableFields) > 0 && string(tmpl.CustomizableFields) != "null" {
		_ = json.Unmarshal(tmpl.CustomizableFields, &templateConfig)
	}

	// Track page view (async)
	go func() {
		ipHash := fmt.Sprintf("%x", sha256.Sum256([]byte(c.ClientIP())))
		view := models.WeddingPageView{
			OrderID:   order.ID,
			IPHash:    ipHash,
			UserAgent: c.GetHeader("User-Agent"),
			Referer:   c.GetHeader("Referer"),
			GuestSlug: guestSlug,
		}
		config.DB.Create(&view)
		config.DB.Model(&models.WeddingInfo{}).
			Where("order_id = ?", order.ID).
			UpdateColumn("view_count", gorm.Expr("view_count + 1"))
	}()

	utils.SuccessResponse(c, http.StatusOK, "", gin.H{
		"order_id":           order.ID,
		"slug":               slug,
		"template":           tmpl,
		"groom_name":         weddingInfo.GroomName,
		"bride_name":         weddingInfo.BrideName,
		"groom_parent":       weddingInfo.GroomParent,
		"bride_parent":       weddingInfo.BrideParent,
		"groom_photo_url":    weddingInfo.GroomPhotoURL,
		"bride_photo_url":    weddingInfo.BridePhotoURL,
		"groom_address":      weddingInfo.GroomAddress,
		"bride_address":      weddingInfo.BrideAddress,
		"wedding_date":       weddingInfo.WeddingDate,
		"lunar_date":         weddingInfo.LunarDate,
		"wedding_time":       weddingInfo.WeddingTime,
		"ceremony_time":      weddingInfo.CeremonyTime,
		"ceremony_venue":     weddingInfo.CeremonyVenue,
		"ceremony_address":   weddingInfo.CeremonyAddress,
		"ceremony_maps_url":  weddingInfo.CeremonyMapsURL,
		"reception_venue":    weddingInfo.ReceptionVenue,
		"reception_time":     weddingInfo.ReceptionTime,
		"reception_address":  weddingInfo.ReceptionAddress,
		"reception_maps_url": weddingInfo.ReceptionMapsURL,
		"venue_address":      weddingInfo.VenueAddress,
		"maps_embed_url":     weddingInfo.MapsEmbedURL,
		"event_description":  weddingInfo.EventDescription,
		"gallery_urls":       galleryURLs,
		"bank_accounts":      bankAccounts,
		"music_url":          weddingInfo.MusicURL,
		"wishes":             wishes,
		"rsvp_count":         rsvpCount,
		"custom_domain":      order.CustomDomain,
		"guest_name":         guestName,
		"view_count":         weddingInfo.ViewCount,
		"visible_sections":   visibleSections,
		"template_config":    templateConfig,
	})
}

// SubmitRSVP — public endpoint for guests
// POST /api/wedding/:slug/rsvp
func SubmitRSVP(c *gin.Context) {
	slug := c.Param("slug")

	var order models.Order
	if err := config.DB.Where("(custom_domain = ? OR published_url = ?) AND status = 'published'", slug, slug).First(&order).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy thiệp cưới")
		return
	}

	var input struct {
		GuestName   string `json:"guest_name" binding:"required"`
		Phone       string `json:"phone"`
		Attending   bool   `json:"attending"`
		GuestCount  int    `json:"guest_count"`
		WishMessage string `json:"wish_message"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	if input.GuestCount < 1 {
		input.GuestCount = 1
	}

	rsvp := models.RSVPResponse{
		OrderID:     order.ID,
		GuestName:   input.GuestName,
		Phone:       input.Phone,
		Attending:   input.Attending,
		GuestCount:  input.GuestCount,
		WishMessage: input.WishMessage,
	}

	if err := config.DB.Create(&rsvp).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "create_error", "Lỗi gửi xác nhận")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Đã gửi xác nhận tham dự", rsvp)
}

// SubmitWish — public endpoint for guests
// POST /api/wedding/:slug/wishes
func SubmitWish(c *gin.Context) {
	slug := c.Param("slug")

	var order models.Order
	if err := config.DB.Where("(custom_domain = ? OR published_url = ?) AND status = 'published'", slug, slug).First(&order).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy thiệp cưới")
		return
	}

	var input struct {
		GuestName string `json:"guest_name" binding:"required"`
		Message   string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	wish := models.GuestWish{
		OrderID:   order.ID,
		GuestName: input.GuestName,
		Message:   input.Message,
	}

	if err := config.DB.Create(&wish).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "create_error", "Lỗi gửi lời chúc")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Đã gửi lời chúc", wish)
}

// GetWishes — public, get wishes for a wedding
// GET /api/wedding/:slug/wishes
func GetWishes(c *gin.Context) {
	slug := c.Param("slug")

	var order models.Order
	if err := config.DB.Where("(custom_domain = ? OR published_url = ?) AND status = 'published'", slug, slug).First(&order).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy thiệp cưới")
		return
	}

	var wishes []models.GuestWish
	config.DB.Where("order_id = ?", order.ID).Order("created_at DESC").Limit(100).Find(&wishes)

	utils.SuccessResponse(c, http.StatusOK, "", wishes)
}
