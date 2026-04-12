package handlers

import (
	"net/http"

	"wedding-api/config"
	"wedding-api/models"
	"wedding-api/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	FullName string `json:"full_name" binding:"required,min=2"`
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UpdateProfileInput struct {
	FullName  string `json:"full_name"`
	Phone     string `json:"phone"`
	AvatarURL string `json:"avatar_url"`
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	var existingUser models.User
	if err := config.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		utils.ErrorResponse(c, http.StatusConflict, "email_exists", "Email already registered")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "hash_error", "Failed to hash password")
		return
	}

	user := models.User{
		FullName:     input.FullName,
		Email:        input.Email,
		Phone:        input.Phone,
		PasswordHash: string(hashedPassword),
		Provider:     "local",
		Role:         "user",
	}

	if err := config.DB.Create(&user).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "create_error", "Failed to create user")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "token_error", "Failed to generate token")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Registration successful", gin.H{
		"user":  user,
		"token": token,
	})
}

func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "invalid_credentials", "Invalid email or password")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "invalid_credentials", "Invalid email or password")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "token_error", "Failed to generate token")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Login successful", gin.H{
		"user":  user,
		"token": token,
	})
}

func Logout(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "Logout successful", nil)
}

func GetMe(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	if err := config.DB.First(&user, "id = ?", userID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "User not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "", user)
}

func UpdateMe(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var input UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "validation_error", err.Error())
		return
	}

	var user models.User
	if err := config.DB.First(&user, "id = ?", userID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "User not found")
		return
	}

	updates := map[string]interface{}{}
	if input.FullName != "" {
		updates["full_name"] = input.FullName
	}
	if input.Phone != "" {
		updates["phone"] = input.Phone
	}
	if input.AvatarURL != "" {
		updates["avatar_url"] = input.AvatarURL
	}

	if len(updates) > 0 {
		config.DB.Model(&user).Updates(updates)
	}

	config.DB.First(&user, "id = ?", userID)
	utils.SuccessResponse(c, http.StatusOK, "Profile updated", user)
}
