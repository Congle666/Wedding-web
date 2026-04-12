package handlers

import (
	"math"
	"net/http"
	"strconv"

	"wedding-api/config"
	"wedding-api/models"
	"wedding-api/utils"

	"github.com/gin-gonic/gin"
)

type CreateReviewInput struct {
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Comment string `json:"comment"`
}

func GetTemplateReviews(c *gin.Context) {
	templateID := c.Param("id")
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
	config.DB.Model(&models.Review{}).
		Where("template_id = ? AND is_approved = ?", templateID, true).
		Count(&total)

	var reviews []models.Review
	config.DB.Where("template_id = ? AND is_approved = ?", templateID, true).
		Preload("User").
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&reviews)

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	utils.SuccessResponse(c, http.StatusOK, "", utils.PaginatedData{
		Items:      reviews,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	})
}

func CreateReview(c *gin.Context) {
	userID, _ := c.Get("user_id")
	templateID := c.Param("id")

	var input CreateReviewInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	// Check template exists
	var tmpl models.Template
	if err := config.DB.First(&tmpl, "id = ?", templateID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Template not found")
		return
	}

	// Check user has rented this template
	var orderItem models.OrderItem
	err := config.DB.
		Joins("JOIN orders ON orders.id = order_items.order_id").
		Where("order_items.template_id = ? AND orders.user_id = ? AND orders.status IN ?",
			templateID, userID, []string{"paid", "published"}).
		First(&orderItem).Error
	if err != nil {
		utils.ErrorResponse(c, http.StatusForbidden, "not_rented", "You must rent this template before reviewing")
		return
	}

	// Check if already reviewed
	var existingReview models.Review
	if err := config.DB.Where("user_id = ? AND template_id = ?", userID, templateID).First(&existingReview).Error; err == nil {
		utils.ErrorResponse(c, http.StatusConflict, "already_reviewed", "You have already reviewed this template")
		return
	}

	review := models.Review{
		UserID:     userID.(string),
		TemplateID: templateID,
		OrderID:    orderItem.OrderID,
		Rating:     input.Rating,
		Comment:    input.Comment,
		IsApproved: false,
	}

	if err := config.DB.Create(&review).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "create_error", "Failed to create review")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Review submitted, pending approval", review)
}
