package handlers

import (
	"net/http"
	"time"

	"wedding-api/config"
	"wedding-api/models"
	"wedding-api/utils"

	"gorm.io/gorm"

	"github.com/gin-gonic/gin"
)

func GetBanners(c *gin.Context) {
	position := c.Query("position")
	now := time.Now()

	query := config.DB.Model(&models.Banner{}).
		Where("is_active = ?", true).
		Where("(started_at IS NULL OR started_at <= ?)", now).
		Where("(ended_at IS NULL OR ended_at >= ?)", now)

	if position != "" {
		query = query.Where("position = ?", position)
	}

	var banners []models.Banner
	query.Order("sort_order ASC").Find(&banners)

	// Increment view count atomically
	for i := range banners {
		config.DB.Model(&banners[i]).UpdateColumn("view_count", gorm.Expr("view_count + 1"))
	}

	utils.SuccessResponse(c, http.StatusOK, "", banners)
}

func ClickBanner(c *gin.Context) {
	bannerID := c.Param("id")

	var banner models.Banner
	if err := config.DB.First(&banner, bannerID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Banner not found")
		return
	}

	config.DB.Model(&banner).UpdateColumn("click_count", gorm.Expr("click_count + 1"))
	utils.SuccessResponse(c, http.StatusOK, "Click recorded", nil)
}
