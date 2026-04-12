package handlers

import (
	"math"
	"net/http"
	"strconv"

	"wedding-api/config"
	"wedding-api/models"
	"wedding-api/utils"

	"gorm.io/gorm"

	"github.com/gin-gonic/gin"
)

func GetCategories(c *gin.Context) {
	var categories []models.TemplateCategory
	config.DB.Where("is_active = ?", true).Order("sort_order ASC").Find(&categories)
	utils.SuccessResponse(c, http.StatusOK, "", categories)
}

func GetTemplates(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := config.DB.Model(&models.Template{}).Where("is_active = ?", true)

	// Filter by category
	if categoryID := c.Query("category_id"); categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	// Filter by has_video
	if hasVideo := c.Query("has_video"); hasVideo == "true" {
		query = query.Where("has_video = ?", true)
	}

	// Filter by price range
	if minPrice := c.Query("min_price"); minPrice != "" {
		query = query.Where("price_per_day >= ?", minPrice)
	}
	if maxPrice := c.Query("max_price"); maxPrice != "" {
		query = query.Where("price_per_day <= ?", maxPrice)
	}

	var total int64
	query.Count(&total)

	// Sort
	switch c.DefaultQuery("sort", "newest") {
	case "popular":
		query = query.Order("view_count DESC")
	case "price_asc":
		query = query.Order("price_per_day ASC")
	case "price_desc":
		query = query.Order("price_per_day DESC")
	default:
		query = query.Order("created_at DESC")
	}

	var templates []models.Template
	query.Preload("Category").Offset(offset).Limit(limit).Find(&templates)

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	utils.SuccessResponse(c, http.StatusOK, "", utils.PaginatedData{
		Items:      templates,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	})
}

func GetTemplateBySlug(c *gin.Context) {
	slug := c.Param("slug")

	var template models.Template
	if err := config.DB.Preload("Category").Where("slug = ? AND is_active = ?", slug, true).First(&template).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Template not found")
		return
	}

	// Increment view count atomically
	config.DB.Model(&template).UpdateColumn("view_count", gorm.Expr("view_count + 1"))

	utils.SuccessResponse(c, http.StatusOK, "", template)
}
