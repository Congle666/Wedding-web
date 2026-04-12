package handlers

import (
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"unicode"

	"wedding-api/config"
	"wedding-api/models"
	"wedding-api/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/text/unicode/norm"
)

// generateGuestSlug creates a URL-safe slug from Vietnamese name
func generateGuestSlug(name string) string {
	// Normalize unicode
	s := norm.NFD.String(name)
	// Remove diacritics
	var b strings.Builder
	for _, r := range s {
		if unicode.Is(unicode.Mn, r) { // Mn = nonspacing marks (diacritics)
			continue
		}
		// Replace đ/Đ
		if r == 'đ' || r == 'Đ' {
			b.WriteRune('d')
			continue
		}
		b.WriteRune(r)
	}
	result := strings.ToLower(b.String())
	// Replace non-alphanumeric with dash
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	result = reg.ReplaceAllString(result, "-")
	result = strings.Trim(result, "-")
	return result
}

type CreateGuestInput struct {
	Name      string `json:"name" binding:"required"`
	Phone     string `json:"phone"`
	GroupName string `json:"group_name"`
	Side      string `json:"side"`
	Notes     string `json:"notes"`
}

// GetGuests - GET /api/orders/:id/guests
func GetGuests(c *gin.Context) {
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

	var guests []models.Guest
	config.DB.Where("order_id = ?", orderID).Order("created_at DESC").Find(&guests)

	utils.SuccessResponse(c, http.StatusOK, "", guests)
}

// CreateGuest - POST /api/orders/:id/guests
func CreateGuest(c *gin.Context) {
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

	var input CreateGuestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	if input.Side == "" {
		input.Side = "both"
	}

	// Generate unique slug
	baseSlug := generateGuestSlug(input.Name)
	slug := baseSlug
	counter := 2
	for {
		var count int64
		config.DB.Model(&models.Guest{}).
			Where("order_id = ? AND slug = ?", orderID, slug).
			Count(&count)
		if count == 0 {
			break
		}
		slug = fmt.Sprintf("%s-%d", baseSlug, counter)
		counter++
	}

	guest := models.Guest{
		OrderID:   orderID,
		Name:      input.Name,
		Slug:      slug,
		Phone:     input.Phone,
		GroupName: input.GroupName,
		Side:      input.Side,
		Notes:     input.Notes,
		IsActive:  true,
	}

	if err := config.DB.Create(&guest).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "create_error", "Lỗi tạo khách mời")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Đã thêm khách mời", guest)
}

// UpdateGuest - PUT /api/orders/:id/guests/:guestId
func UpdateGuest(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")
	orderID := c.Param("id")
	guestID := c.Param("guestId")

	var order models.Order
	query := config.DB.Where("id = ?", orderID)
	if userRole != "admin" {
		query = query.Where("user_id = ?", userID)
	}
	if err := query.First(&order).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Order not found")
		return
	}

	var guest models.Guest
	if err := config.DB.Where("id = ? AND order_id = ?", guestID, orderID).First(&guest).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Guest not found")
		return
	}

	var input struct {
		Name      string `json:"name"`
		Phone     string `json:"phone"`
		GroupName string `json:"group_name"`
		Side      string `json:"side"`
		Notes     string `json:"notes"`
		IsActive  *bool  `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	if input.Name != "" {
		guest.Name = input.Name
	}
	if input.Phone != "" {
		guest.Phone = input.Phone
	}
	if input.GroupName != "" {
		guest.GroupName = input.GroupName
	}
	if input.Side != "" {
		guest.Side = input.Side
	}
	if input.Notes != "" {
		guest.Notes = input.Notes
	}
	if input.IsActive != nil {
		guest.IsActive = *input.IsActive
	}

	config.DB.Save(&guest)
	utils.SuccessResponse(c, http.StatusOK, "Đã cập nhật khách mời", guest)
}

// DeleteGuest - DELETE /api/orders/:id/guests/:guestId
func DeleteGuest(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")
	orderID := c.Param("id")
	guestID := c.Param("guestId")

	var order models.Order
	query := config.DB.Where("id = ?", orderID)
	if userRole != "admin" {
		query = query.Where("user_id = ?", userID)
	}
	if err := query.First(&order).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Order not found")
		return
	}

	result := config.DB.Where("id = ? AND order_id = ?", guestID, orderID).Delete(&models.Guest{})
	if result.RowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Guest not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Đã xóa khách mời", nil)
}
