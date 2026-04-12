package handlers

import (
	"math"
	"net/http"
	"strconv"
	"time"

	"wedding-api/config"
	"wedding-api/models"
	"wedding-api/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AdminCouponInput struct {
	Code      string  `json:"code" binding:"required"`
	Type      string  `json:"type" binding:"required,oneof=percent fixed"`
	Value     float64 `json:"value" binding:"required"`
	MinOrder  float64 `json:"min_order"`
	MaxUses   *int    `json:"max_uses"`
	ExpiresAt string  `json:"expires_at"`
	IsActive  bool    `json:"is_active"`
}

func AdminListCoupons(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := config.DB.Model(&models.Coupon{})

	if search := c.Query("search"); search != "" {
		query = query.Where("code LIKE ?", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	var coupons []models.Coupon
	query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&coupons)

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	utils.SuccessResponse(c, http.StatusOK, "", utils.PaginatedData{
		Items:      coupons,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	})
}

func AdminGetCouponByID(c *gin.Context) {
	couponID := c.Param("id")

	var coupon models.Coupon
	if err := config.DB.First(&coupon, "id = ?", couponID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy mã giảm giá")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "", coupon)
}

func AdminCreateCoupon(c *gin.Context) {
	var input AdminCouponInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	coupon := models.Coupon{
		ID:        uuid.New().String(),
		Code:      input.Code,
		Type:      input.Type,
		Value:     input.Value,
		MinOrder:  input.MinOrder,
		MaxUses:   input.MaxUses,
		UsedCount: 0,
		IsActive:  input.IsActive,
	}

	if input.ExpiresAt != "" {
		t, err := time.Parse("2006-01-02", input.ExpiresAt)
		if err == nil {
			coupon.ExpiresAt = &t
		}
	}

	if err := config.DB.Create(&coupon).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "create_error", "Không thể tạo mã giảm giá: "+err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Đã tạo mã giảm giá", coupon)
}

func AdminUpdateCoupon(c *gin.Context) {
	couponID := c.Param("id")

	var coupon models.Coupon
	if err := config.DB.First(&coupon, "id = ?", couponID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy mã giảm giá")
		return
	}

	var input AdminCouponInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	updates := map[string]interface{}{
		"code":      input.Code,
		"type":      input.Type,
		"value":     input.Value,
		"min_order": input.MinOrder,
		"max_uses":  input.MaxUses,
		"is_active": input.IsActive,
	}

	if input.ExpiresAt != "" {
		t, err := time.Parse("2006-01-02", input.ExpiresAt)
		if err == nil {
			updates["expires_at"] = t
		}
	} else {
		updates["expires_at"] = nil
	}

	if err := config.DB.Model(&coupon).Updates(updates).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "update_error", err.Error())
		return
	}

	config.DB.First(&coupon, "id = ?", couponID)
	utils.SuccessResponse(c, http.StatusOK, "Đã cập nhật mã giảm giá", coupon)
}

func AdminDeleteCoupon(c *gin.Context) {
	couponID := c.Param("id")

	var coupon models.Coupon
	if err := config.DB.First(&coupon, "id = ?", couponID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy mã giảm giá")
		return
	}

	// Check if any orders reference this coupon
	var orderCount int64
	config.DB.Model(&models.Order{}).Where("coupon_id = ?", couponID).Count(&orderCount)
	if orderCount > 0 {
		// Don't delete, just deactivate
		config.DB.Model(&coupon).Update("is_active", false)
		utils.SuccessResponse(c, http.StatusOK, "Mã giảm giá đã được vô hiệu hoá (có đơn hàng đang sử dụng)", coupon)
		return
	}

	if err := config.DB.Delete(&coupon).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "delete_error", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Đã xoá mã giảm giá", nil)
}
