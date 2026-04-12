package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"wedding-api/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var allowedImageTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/webp": true,
	"image/gif":  true,
}

var allowedAudioTypes = map[string]bool{
	"audio/mpeg": true,
	"audio/mp3":  true,
	"audio/wav":  true,
	"audio/ogg":  true,
}

func UploadImage(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "no_file", "Vui lòng chọn file ảnh")
		return
	}

	// Max 5MB
	if file.Size > 5*1024*1024 {
		utils.ErrorResponse(c, http.StatusBadRequest, "file_too_large", "File không được vượt quá 5MB")
		return
	}

	// Check content type
	contentType := file.Header.Get("Content-Type")
	if !allowedImageTypes[contentType] {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid_type", "Chỉ chấp nhận file JPG, PNG, WebP, GIF")
		return
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	if ext == "" {
		switch contentType {
		case "image/jpeg":
			ext = ".jpg"
		case "image/png":
			ext = ".png"
		case "image/webp":
			ext = ".webp"
		case "image/gif":
			ext = ".gif"
		}
	}
	filename := uuid.New().String() + ext

	// Ensure uploads directory exists
	uploadDir := "uploads"
	os.MkdirAll(uploadDir, 0755)

	savePath := filepath.Join(uploadDir, filename)
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "save_error", "Lỗi lưu file")
		return
	}

	// Build URL
	host := c.Request.Host
	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	if fwd := c.GetHeader("X-Forwarded-Proto"); fwd != "" {
		scheme = fwd
	}
	url := fmt.Sprintf("%s://%s/uploads/%s", scheme, host, filename)

	utils.SuccessResponse(c, http.StatusOK, "Upload thành công", gin.H{
		"url":      url,
		"filename": filename,
		"size":     file.Size,
	})
}

func UploadMultipleImages(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "no_files", "Vui lòng chọn file ảnh")
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "no_files", "Vui lòng chọn ít nhất 1 file")
		return
	}
	if len(files) > 10 {
		utils.ErrorResponse(c, http.StatusBadRequest, "too_many", "Tối đa 10 file mỗi lần upload")
		return
	}

	uploadDir := "uploads"
	os.MkdirAll(uploadDir, 0755)

	var urls []string
	for _, file := range files {
		if file.Size > 5*1024*1024 {
			continue
		}
		contentType := file.Header.Get("Content-Type")
		if !allowedImageTypes[contentType] {
			continue
		}

		ext := filepath.Ext(file.Filename)
		if ext == "" {
			ext = ".jpg"
		}
		filename := uuid.New().String() + ext
		savePath := filepath.Join(uploadDir, filename)

		if err := c.SaveUploadedFile(file, savePath); err != nil {
			continue
		}

		host := c.Request.Host
		scheme := "http"
		if fwd := c.GetHeader("X-Forwarded-Proto"); fwd != "" {
			scheme = fwd
		}
		urls = append(urls, fmt.Sprintf("%s://%s/uploads/%s", scheme, host, filename))
	}

	utils.SuccessResponse(c, http.StatusOK, "Upload thành công", gin.H{
		"urls":  urls,
		"count": len(urls),
	})
}

// UploadAudio handles audio file upload (MP3, WAV, OGG) - max 10MB
func UploadAudio(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "no_file", "Vui lòng chọn file nhạc")
		return
	}

	// Max 10MB
	if file.Size > 10*1024*1024 {
		utils.ErrorResponse(c, http.StatusBadRequest, "file_too_large", "File nhạc không được vượt quá 10MB")
		return
	}

	contentType := file.Header.Get("Content-Type")
	if !allowedAudioTypes[contentType] {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid_type", "Chỉ chấp nhận file MP3, WAV, OGG")
		return
	}

	ext := filepath.Ext(file.Filename)
	if ext == "" {
		ext = ".mp3"
	}
	filename := uuid.New().String() + ext

	uploadDir := "uploads"
	os.MkdirAll(uploadDir, 0755)

	savePath := filepath.Join(uploadDir, filename)
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "save_error", "Lỗi lưu file")
		return
	}

	host := c.Request.Host
	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	if fwd := c.GetHeader("X-Forwarded-Proto"); fwd != "" {
		scheme = fwd
	}
	url := fmt.Sprintf("%s://%s/uploads/%s", scheme, host, filename)

	utils.SuccessResponse(c, http.StatusOK, "Upload nhạc thành công", gin.H{
		"url":      url,
		"filename": filename,
		"size":     file.Size,
	})
}

// Serve static upload files - not needed if using gin.Static
func init() {
	_ = strings.ToLower // avoid unused import
}
