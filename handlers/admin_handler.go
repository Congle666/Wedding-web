package handlers

import (
	"fmt"
	"math"
	"net/http"
	"strconv"
	"time"

	"wedding-api/config"
	"wedding-api/models"
	"wedding-api/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
)

// ============ TEMPLATE MANAGEMENT ============

type AdminTemplateInput struct {
	CategoryID         uint           `json:"category_id" binding:"required"`
	Name               string         `json:"name" binding:"required"`
	Slug               string         `json:"slug" binding:"required"`
	ThumbnailURL       string         `json:"thumbnail_url"`
	PreviewImages      datatypes.JSON `json:"preview_images"`
	PricePerDay        float64        `json:"price_per_day"`
	PricePerMonth      float64        `json:"price_per_month"`
	CustomizableFields datatypes.JSON `json:"customizable_fields"`
	Description        string         `json:"description"`
	HtmlContent        string         `json:"html_content"`
	ThemeSlug          string         `json:"theme_slug"`
	IsFree             bool           `json:"is_free"`
	HasVideo           bool           `json:"has_video"`
	IsActive           bool           `json:"is_active"`
}

func AdminCreateTemplate(c *gin.Context) {
	var input AdminTemplateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	if err := utils.ValidateTemplateConfigJSON(input.CustomizableFields); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid_template_config", err.Error())
		return
	}

	template := models.Template{
		CategoryID:         input.CategoryID,
		Name:               input.Name,
		Slug:               input.Slug,
		ThumbnailURL:       input.ThumbnailURL,
		PreviewImages:      input.PreviewImages,
		PricePerDay:        input.PricePerDay,
		PricePerMonth:      input.PricePerMonth,
		CustomizableFields: input.CustomizableFields,
		Description:        input.Description,
		HtmlContent:        input.HtmlContent,
		ThemeSlug:          input.ThemeSlug,
		IsFree:             input.IsFree,
		HasVideo:           input.HasVideo,
		IsActive:           input.IsActive,
	}
	if template.ThemeSlug == "" {
		template.ThemeSlug = "songphung-red"
	}

	if err := config.DB.Create(&template).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "create_error", "Failed to create template")
		return
	}

	config.DB.Preload("Category").First(&template, "id = ?", template.ID)
	utils.SuccessResponse(c, http.StatusCreated, "Template created", template)
}

func AdminUpdateTemplate(c *gin.Context) {
	templateID := c.Param("id")

	var template models.Template
	if err := config.DB.First(&template, "id = ?", templateID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Template not found")
		return
	}

	var input AdminTemplateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	if err := utils.ValidateTemplateConfigJSON(input.CustomizableFields); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid_template_config", err.Error())
		return
	}

	updates := map[string]interface{}{
		"category_id":         input.CategoryID,
		"name":                input.Name,
		"slug":                input.Slug,
		"thumbnail_url":       input.ThumbnailURL,
		"preview_images":      input.PreviewImages,
		"price_per_day":       input.PricePerDay,
		"price_per_month":     input.PricePerMonth,
		"customizable_fields": input.CustomizableFields,
		"description":         input.Description,
		"html_content":        input.HtmlContent,
		"theme_slug":          input.ThemeSlug,
		"is_free":             input.IsFree,
		"has_video":           input.HasVideo,
		"is_active":           input.IsActive,
	}
	config.DB.Model(&template).Updates(updates)

	config.DB.Preload("Category").First(&template, "id = ?", templateID)
	utils.SuccessResponse(c, http.StatusOK, "Template updated", template)
}

// ============ BANNER MANAGEMENT ============

type AdminBannerInput struct {
	Title          string `json:"title" binding:"required"`
	ImageURL       string `json:"image_url" binding:"required"`
	ImageMobileURL string `json:"image_mobile_url"`
	LinkURL        string `json:"link_url"`
	LinkTarget     string `json:"link_target"`
	Position       string `json:"position" binding:"required"`
	SortOrder      int    `json:"sort_order"`
	IsActive       bool   `json:"is_active"`
	StartedAt      string `json:"started_at"`
	EndedAt        string `json:"ended_at"`
}

func AdminCreateBanner(c *gin.Context) {
	var input AdminBannerInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	banner := models.Banner{
		Title:          input.Title,
		ImageURL:       input.ImageURL,
		ImageMobileURL: input.ImageMobileURL,
		LinkURL:        input.LinkURL,
		LinkTarget:     input.LinkTarget,
		Position:       input.Position,
		SortOrder:      input.SortOrder,
		IsActive:       input.IsActive,
	}

	if input.LinkTarget == "" {
		banner.LinkTarget = "_self"
	}

	if input.StartedAt != "" {
		t, err := parseDateTime(input.StartedAt)
		if err == nil {
			banner.StartedAt = &t
		}
	}
	if input.EndedAt != "" {
		t, err := parseDateTime(input.EndedAt)
		if err == nil {
			banner.EndedAt = &t
		}
	}

	if err := config.DB.Create(&banner).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "create_error", "Failed to create banner")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Banner created", banner)
}

func AdminUpdateBanner(c *gin.Context) {
	bannerID := c.Param("id")

	var banner models.Banner
	if err := config.DB.First(&banner, bannerID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Banner not found")
		return
	}

	var input AdminBannerInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	linkTarget := input.LinkTarget
	if linkTarget == "" {
		linkTarget = "_self"
	}

	updates := map[string]interface{}{
		"title":            input.Title,
		"image_url":        input.ImageURL,
		"image_mobile_url": input.ImageMobileURL,
		"link_url":         input.LinkURL,
		"link_target":      linkTarget,
		"position":         input.Position,
		"sort_order":       input.SortOrder,
		"is_active":        input.IsActive,
	}

	if input.StartedAt != "" {
		t, err := parseDateTime(input.StartedAt)
		if err == nil {
			updates["started_at"] = t
		}
	}
	if input.EndedAt != "" {
		t, err := parseDateTime(input.EndedAt)
		if err == nil {
			updates["ended_at"] = t
		}
	}

	if err := config.DB.Model(&banner).Updates(updates).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "update_error", err.Error())
		return
	}
	config.DB.First(&banner, bannerID)

	utils.SuccessResponse(c, http.StatusOK, "Banner updated", banner)
}

func AdminDeleteTemplate(c *gin.Context) {
	templateID := c.Param("id")

	var tmpl models.Template
	if err := config.DB.First(&tmpl, "id = ?", templateID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy mẫu thiệp")
		return
	}

	// Check FK: order_items references templates ON DELETE RESTRICT
	var orderItemCount int64
	config.DB.Model(&models.OrderItem{}).Where("template_id = ?", templateID).Count(&orderItemCount)
	if orderItemCount > 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "has_orders", fmt.Sprintf("Không thể xoá: có %d đơn hàng đang sử dụng mẫu thiệp này", orderItemCount))
		return
	}

	// Check FK: reviews references templates ON DELETE CASCADE (ok to delete)
	// Delete reviews first
	config.DB.Where("template_id = ?", templateID).Delete(&models.Review{})

	if err := config.DB.Delete(&tmpl).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "delete_error", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Đã xoá mẫu thiệp", nil)
}

func AdminDeleteBanner(c *gin.Context) {
	bannerID := c.Param("id")

	var banner models.Banner
	if err := config.DB.First(&banner, bannerID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Banner not found")
		return
	}

	if err := config.DB.Delete(&banner).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "delete_error", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Đã xoá banner", nil)
}

// ============ ORDER MANAGEMENT ============

type UpdateOrderStatusInput struct {
	Status string `json:"status" binding:"required,oneof=pending paid published expired cancelled"`
}

func AdminGetOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := config.DB.Model(&models.Order{})

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	var orders []models.Order
	query.Preload("User").
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

func AdminUpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("id")

	var order models.Order
	if err := config.DB.First(&order, "id = ?", orderID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Order not found")
		return
	}

	var input UpdateOrderStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	config.DB.Model(&order).Update("status", input.Status)
	order.Status = input.Status

	utils.SuccessResponse(c, http.StatusOK, "Order status updated", order)
}

// ============ REVIEW MANAGEMENT ============

func AdminGetPendingReviews(c *gin.Context) {
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
	config.DB.Model(&models.Review{}).Where("is_approved = ?", false).Count(&total)

	var reviews []models.Review
	config.DB.Where("is_approved = ?", false).
		Preload("User").
		Preload("Template").
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

func AdminApproveReview(c *gin.Context) {
	reviewID := c.Param("id")

	var review models.Review
	if err := config.DB.First(&review, "id = ?", reviewID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Review not found")
		return
	}

	config.DB.Model(&review).Update("is_approved", true)
	review.IsApproved = true

	utils.SuccessResponse(c, http.StatusOK, "Review approved", review)
}

// ============ ADMIN GET TEMPLATE BY ID ============

func AdminGetTemplateByID(c *gin.Context) {
	templateID := c.Param("id")

	var template models.Template
	if err := config.DB.Preload("Category").First(&template, "id = ?", templateID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy mẫu thiệp")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "", template)
}

// ============ ADMIN LIST ALL BANNERS ============

func AdminListBanners(c *gin.Context) {
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
	config.DB.Model(&models.Banner{}).Count(&total)

	var banners []models.Banner
	config.DB.Order("sort_order ASC, created_at DESC").
		Offset(offset).Limit(limit).
		Find(&banners)

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	utils.SuccessResponse(c, http.StatusOK, "", utils.PaginatedData{
		Items:      banners,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	})
}

// ============ ADMIN GET ORDER BY ID ============

func AdminGetOrderByID(c *gin.Context) {
	orderID := c.Param("id")

	var order models.Order
	if err := config.DB.Preload("User").
		Preload("OrderItems.Template").
		Preload("Coupon").
		First(&order, "id = ?", orderID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy đơn hàng")
		return
	}

	var weddingInfo *models.WeddingInfo
	var wi models.WeddingInfo
	if err := config.DB.Where("order_id = ?", orderID).First(&wi).Error; err == nil {
		weddingInfo = &wi
	}

	utils.SuccessResponse(c, http.StatusOK, "", gin.H{
		"order":        order,
		"wedding_info": weddingInfo,
	})
}

// ============ ADMIN DELETE REVIEW ============

func AdminDeleteReview(c *gin.Context) {
	reviewID := c.Param("id")

	var review models.Review
	if err := config.DB.First(&review, "id = ?", reviewID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy đánh giá")
		return
	}

	if err := config.DB.Delete(&review).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "delete_error", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Đã xoá đánh giá", nil)
}

// ============ ADMIN USER MANAGEMENT ============

func AdminListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := config.DB.Model(&models.User{})

	if search := c.Query("search"); search != "" {
		like := "%" + search + "%"
		query = query.Where("email LIKE ? OR full_name LIKE ?", like, like)
	}

	var total int64
	query.Count(&total)

	type UserWithOrderCount struct {
		models.User
		OrderCount int64 `json:"order_count"`
	}

	var users []models.User
	query.Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&users)

	var result []UserWithOrderCount
	for _, u := range users {
		var count int64
		config.DB.Model(&models.Order{}).Where("user_id = ?", u.ID).Count(&count)
		result = append(result, UserWithOrderCount{
			User:       u,
			OrderCount: count,
		})
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	utils.SuccessResponse(c, http.StatusOK, "", utils.PaginatedData{
		Items:      result,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	})
}

func AdminGetUserByID(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	if err := config.DB.First(&user, "id = ?", userID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy người dùng")
		return
	}

	var orderCount int64
	config.DB.Model(&models.Order{}).Where("user_id = ?", userID).Count(&orderCount)

	utils.SuccessResponse(c, http.StatusOK, "", gin.H{
		"user":        user,
		"order_count": orderCount,
	})
}

// ============ ADMIN CATEGORY MANAGEMENT ============

type AdminCategoryInput struct {
	Name         string `json:"name" binding:"required"`
	Slug         string `json:"slug" binding:"required"`
	Description  string `json:"description"`
	ThumbnailURL string `json:"thumbnail_url"`
	SortOrder    int    `json:"sort_order"`
	IsActive     bool   `json:"is_active"`
}

func AdminCreateCategory(c *gin.Context) {
	var input AdminCategoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	category := models.TemplateCategory{
		Name:         input.Name,
		Slug:         input.Slug,
		Description:  input.Description,
		ThumbnailURL: input.ThumbnailURL,
		SortOrder:    input.SortOrder,
		IsActive:     input.IsActive,
	}

	if err := config.DB.Create(&category).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "create_error", "Không thể tạo danh mục")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Đã tạo danh mục", category)
}

func AdminUpdateCategory(c *gin.Context) {
	categoryID := c.Param("id")

	var category models.TemplateCategory
	if err := config.DB.First(&category, "id = ?", categoryID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy danh mục")
		return
	}

	var input AdminCategoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	updates := map[string]interface{}{
		"name":          input.Name,
		"slug":          input.Slug,
		"description":   input.Description,
		"thumbnail_url": input.ThumbnailURL,
		"sort_order":    input.SortOrder,
		"is_active":     input.IsActive,
	}

	if err := config.DB.Model(&category).Updates(updates).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "update_error", err.Error())
		return
	}

	config.DB.First(&category, "id = ?", categoryID)
	utils.SuccessResponse(c, http.StatusOK, "Đã cập nhật danh mục", category)
}

func AdminDeleteCategory(c *gin.Context) {
	categoryID := c.Param("id")

	var category models.TemplateCategory
	if err := config.DB.First(&category, "id = ?", categoryID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy danh mục")
		return
	}

	// Check if any templates reference this category
	var templateCount int64
	config.DB.Model(&models.Template{}).Where("category_id = ?", categoryID).Count(&templateCount)
	if templateCount > 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "has_templates",
			fmt.Sprintf("Không thể xoá danh mục vì còn %d mẫu thiệp đang sử dụng", templateCount))
		return
	}

	if err := config.DB.Delete(&category).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "delete_error", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Đã xoá danh mục", nil)
}

// ============ ADMIN DASHBOARD STATS ============

type ChartDataPoint struct {
	Date        string  `json:"date"`
	Revenue     float64 `json:"revenue"`
	OrdersCount int64   `json:"orders_count"`
}

type DashboardStatsResponse struct {
	OrdersCount    int64            `json:"orders_count"`
	Revenue        float64          `json:"revenue"`
	NewUsers       int64            `json:"new_users"`
	PendingReviews int64            `json:"pending_reviews"`
	ChartData      []ChartDataPoint `json:"chart_data"`
}

func AdminDashboardStats(c *gin.Context) {
	period := c.DefaultQuery("period", "month")
	dateStr := c.DefaultQuery("date", time.Now().Format("2006-01-02"))

	refDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		refDate = time.Now()
	}

	// Calculate period boundaries
	var periodStart, periodEnd time.Time
	switch period {
	case "day":
		periodStart = time.Date(refDate.Year(), refDate.Month(), refDate.Day(), 0, 0, 0, 0, refDate.Location())
		periodEnd = periodStart.AddDate(0, 0, 1)
	case "week":
		// Start of the week (Monday)
		weekday := int(refDate.Weekday())
		if weekday == 0 {
			weekday = 7
		}
		periodStart = time.Date(refDate.Year(), refDate.Month(), refDate.Day()-(weekday-1), 0, 0, 0, 0, refDate.Location())
		periodEnd = periodStart.AddDate(0, 0, 7)
	case "quarter":
		q := (int(refDate.Month()) - 1) / 3
		periodStart = time.Date(refDate.Year(), time.Month(q*3+1), 1, 0, 0, 0, 0, refDate.Location())
		periodEnd = periodStart.AddDate(0, 3, 0)
	case "year":
		periodStart = time.Date(refDate.Year(), 1, 1, 0, 0, 0, 0, refDate.Location())
		periodEnd = periodStart.AddDate(1, 0, 0)
	default: // month
		periodStart = time.Date(refDate.Year(), refDate.Month(), 1, 0, 0, 0, 0, refDate.Location())
		periodEnd = periodStart.AddDate(0, 1, 0)
	}

	// Aggregate stats for the period
	var ordersCount int64
	config.DB.Model(&models.Order{}).
		Where("created_at >= ? AND created_at < ?", periodStart, periodEnd).
		Count(&ordersCount)

	var revenue float64
	config.DB.Model(&models.Order{}).
		Where("created_at >= ? AND created_at < ? AND status IN ?", periodStart, periodEnd, []string{"paid", "published"}).
		Select("COALESCE(SUM(total), 0)").
		Scan(&revenue)

	var newUsers int64
	config.DB.Model(&models.User{}).
		Where("created_at >= ? AND created_at < ?", periodStart, periodEnd).
		Count(&newUsers)

	var pendingReviews int64
	config.DB.Model(&models.Review{}).
		Where("is_approved = ?", false).
		Count(&pendingReviews)

	// Generate chart data
	var chartData []ChartDataPoint

	switch period {
	case "day":
		// Last 30 days, each entry = 1 day
		for i := 29; i >= 0; i-- {
			dayStart := time.Date(refDate.Year(), refDate.Month(), refDate.Day()-i, 0, 0, 0, 0, refDate.Location())
			dayEnd := dayStart.AddDate(0, 0, 1)
			point := buildChartPoint(dayStart, dayEnd, dayStart.Format("2006-01-02"))
			chartData = append(chartData, point)
		}
	case "week":
		// Last 12 weeks, each entry = 1 week
		for i := 11; i >= 0; i-- {
			weekday := int(refDate.Weekday())
			if weekday == 0 {
				weekday = 7
			}
			currentMonday := time.Date(refDate.Year(), refDate.Month(), refDate.Day()-(weekday-1), 0, 0, 0, 0, refDate.Location())
			wStart := currentMonday.AddDate(0, 0, -i*7)
			wEnd := wStart.AddDate(0, 0, 7)
			point := buildChartPoint(wStart, wEnd, wStart.Format("2006-01-02"))
			chartData = append(chartData, point)
		}
	case "quarter":
		// Last 4 quarters
		currentQ := (int(refDate.Month()) - 1) / 3
		currentYear := refDate.Year()
		for i := 3; i >= 0; i-- {
			q := currentQ - i
			y := currentYear
			for q < 0 {
				q += 4
				y--
			}
			qStart := time.Date(y, time.Month(q*3+1), 1, 0, 0, 0, 0, refDate.Location())
			qEnd := qStart.AddDate(0, 3, 0)
			label := fmt.Sprintf("Q%d %d", q+1, y)
			point := buildChartPoint(qStart, qEnd, label)
			chartData = append(chartData, point)
		}
	case "year":
		// Last 3 years
		for i := 2; i >= 0; i-- {
			yStart := time.Date(refDate.Year()-i, 1, 1, 0, 0, 0, 0, refDate.Location())
			yEnd := yStart.AddDate(1, 0, 0)
			point := buildChartPoint(yStart, yEnd, fmt.Sprintf("%d", refDate.Year()-i))
			chartData = append(chartData, point)
		}
	default: // month
		// Last 12 months, each entry = 1 month
		for i := 11; i >= 0; i-- {
			mStart := time.Date(refDate.Year(), refDate.Month()-time.Month(i), 1, 0, 0, 0, 0, refDate.Location())
			mEnd := mStart.AddDate(0, 1, 0)
			point := buildChartPoint(mStart, mEnd, mStart.Format("2006-01"))
			chartData = append(chartData, point)
		}
	}

	utils.SuccessResponse(c, http.StatusOK, "", DashboardStatsResponse{
		OrdersCount:    ordersCount,
		Revenue:        revenue,
		NewUsers:       newUsers,
		PendingReviews: pendingReviews,
		ChartData:      chartData,
	})
}

func buildChartPoint(start, end time.Time, label string) ChartDataPoint {
	var count int64
	config.DB.Model(&models.Order{}).
		Where("created_at >= ? AND created_at < ?", start, end).
		Count(&count)

	var rev float64
	config.DB.Model(&models.Order{}).
		Where("created_at >= ? AND created_at < ? AND status IN ?", start, end, []string{"paid", "published"}).
		Select("COALESCE(SUM(total), 0)").
		Scan(&rev)

	return ChartDataPoint{
		Date:        label,
		Revenue:     rev,
		OrdersCount: count,
	}
}
