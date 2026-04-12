package handlers

import (
	"net/http"

	"wedding-api/config"
	"wedding-api/models"
	"wedding-api/utils"

	"github.com/gin-gonic/gin"
)

func AdminListThemes(c *gin.Context) {
	var themes []models.Theme
	config.DB.Where("is_active = ?", true).Order("sort_order ASC").Find(&themes)
	utils.SuccessResponse(c, http.StatusOK, "", themes)
}
