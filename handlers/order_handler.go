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
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type CreateOrderInput struct {
	PackageType  string           `json:"package_type" binding:"required,oneof=daily monthly"`
	RentalStart  string           `json:"rental_start" binding:"required"`
	DurationDays int              `json:"duration_days" binding:"required,min=1"`
	Items        []OrderItemInput `json:"items" binding:"required,min=1"`
	CouponCode   string           `json:"coupon_code"`
	CustomDomain string           `json:"custom_domain"`
}

type OrderItemInput struct {
	TemplateID     string         `json:"template_id" binding:"required"`
	ConfigSnapshot datatypes.JSON `json:"config_snapshot"`
}

func CreateOrder(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var input CreateOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	rentalStart, err := time.Parse("2006-01-02", input.RentalStart)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid_date", "rental_start must be YYYY-MM-DD")
		return
	}
	rentalEnd := rentalStart.AddDate(0, 0, input.DurationDays)

	// Build order items and calculate subtotal
	var subtotal float64
	var orderItems []models.OrderItem
	for _, item := range input.Items {
		var tmpl models.Template
		if err := config.DB.First(&tmpl, "id = ? AND is_active = ?", item.TemplateID, true).Error; err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "template_not_found", "Template "+item.TemplateID+" not found")
			return
		}

		var price float64
		if input.PackageType == "daily" {
			price = tmpl.PricePerDay * float64(input.DurationDays)
		} else {
			months := math.Ceil(float64(input.DurationDays) / 30.0)
			price = tmpl.PricePerMonth * months
		}

		configSnapshot := datatypes.JSON([]byte("{}"))
		if item.ConfigSnapshot != nil {
			configSnapshot = item.ConfigSnapshot
		}

		orderItems = append(orderItems, models.OrderItem{
			TemplateID:     item.TemplateID,
			PriceSnapshot:  price,
			ConfigSnapshot: configSnapshot,
		})
		subtotal += price
	}

	// Apply coupon
	var discount float64
	var couponID *string
	if input.CouponCode != "" {
		var coupon models.Coupon
		now := time.Now()
		err := config.DB.Where(
			"code = ? AND is_active = ? AND (expires_at IS NULL OR expires_at > ?) AND (max_uses IS NULL OR used_count < max_uses)",
			input.CouponCode, true, now,
		).First(&coupon).Error
		if err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "invalid_coupon", "Coupon is invalid or expired")
			return
		}
		if subtotal < coupon.MinOrder {
			utils.ErrorResponse(c, http.StatusBadRequest, "min_order_not_met", "Order subtotal does not meet minimum for this coupon")
			return
		}

		if coupon.Type == "percent" {
			discount = subtotal * coupon.Value / 100
		} else {
			discount = coupon.Value
		}
		if discount > subtotal {
			discount = subtotal
		}

		couponID = &coupon.ID
		config.DB.Model(&coupon).UpdateColumn("used_count", gorm.Expr("used_count + 1"))
	}

	total := subtotal - discount

	// Nếu template miễn phí hoặc tổng = 0 → auto set "paid"
	isFree := total == 0
	orderStatus := "pending"
	if isFree {
		orderStatus = "paid"
	}

	order := models.Order{
		UserID:       userID.(string),
		Status:       orderStatus,
		PackageType:  input.PackageType,
		RentalStart:  &rentalStart,
		RentalEnd:    &rentalEnd,
		DurationDays: input.DurationDays,
		Subtotal:     subtotal,
		Discount:     discount,
		Total:        total,
		CustomDomain: input.CustomDomain,
		CouponID:     couponID,
		OrderItems:   orderItems,
	}

	if err := config.DB.Create(&order).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "create_error", "Failed to create order")
		return
	}

	config.DB.Preload("OrderItems.Template").Preload("Coupon").First(&order, "id = ?", order.ID)
	utils.SuccessResponse(c, http.StatusCreated, "Order created", order)
}

func GetOrders(c *gin.Context) {
	userID, _ := c.Get("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}
	offset := (page - 1) * limit

	var total int64
	config.DB.Model(&models.Order{}).Where("user_id = ?", userID).Count(&total)

	var orders []models.Order
	config.DB.Where("user_id = ?", userID).
		Preload("OrderItems.Template").
		Preload("Coupon").
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&orders)

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	utils.SuccessResponse(c, http.StatusOK, "", utils.PaginatedData{
		Items:      orders,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	})
}

func GetOrderByID(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")
	orderID := c.Param("id")

	var order models.Order
	query := config.DB.Preload("OrderItems.Template").Preload("Coupon").Where("id = ?", orderID)
	if userRole != "admin" {
		query = query.Where("user_id = ?", userID)
	}
	if err := query.First(&order).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Order not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "", order)
}

func CancelOrder(c *gin.Context) {
	userID, _ := c.Get("user_id")
	orderID := c.Param("id")

	var order models.Order
	if err := config.DB.Where("id = ? AND user_id = ?", orderID, userID).First(&order).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Order not found")
		return
	}

	if order.Status != "pending" {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid_status", "Only pending orders can be cancelled")
		return
	}

	config.DB.Model(&order).Update("status", "cancelled")
	order.Status = "cancelled"

	utils.SuccessResponse(c, http.StatusOK, "Order cancelled", order)
}
