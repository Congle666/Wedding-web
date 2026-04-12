package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"wedding-api/config"
	"wedding-api/models"

	"github.com/gin-gonic/gin"
)

// RenderWeddingPage serves the public wedding invitation page
// GET /w/:slug — where slug is the order's custom_domain or published_url
func RenderWeddingPage(c *gin.Context) {
	slug := c.Param("slug")

	// Find the order by custom_domain or published_url
	var order models.Order
	err := config.DB.
		Preload("OrderItems").
		Where("(custom_domain = ? OR published_url = ?) AND status = 'published'", slug, slug).
		First(&order).Error
	if err != nil {
		c.HTML(http.StatusNotFound, "", nil)
		c.String(http.StatusNotFound, renderErrorPage("Không tìm thấy thiệp cưới", "Đường dẫn không hợp lệ hoặc thiệp chưa được publish."))
		return
	}

	// Get template HTML
	if len(order.OrderItems) == 0 {
		c.String(http.StatusNotFound, renderErrorPage("Lỗi", "Đơn hàng không có mẫu thiệp."))
		return
	}

	var tmpl models.Template
	if err := config.DB.First(&tmpl, "id = ?", order.OrderItems[0].TemplateID).Error; err != nil {
		c.String(http.StatusNotFound, renderErrorPage("Lỗi", "Không tìm thấy mẫu thiệp."))
		return
	}

	if tmpl.HtmlContent == "" {
		c.String(http.StatusNotFound, renderErrorPage("Chưa có mẫu", "Mẫu thiệp này chưa có nội dung HTML. Vui lòng liên hệ admin."))
		return
	}

	// Get wedding info
	var weddingInfo models.WeddingInfo
	config.DB.Where("order_id = ?", order.ID).First(&weddingInfo)

	// Replace placeholders in HTML
	html := replacePlaceholders(tmpl.HtmlContent, &weddingInfo, &order)

	c.Header("Content-Type", "text/html; charset=utf-8")
	c.String(http.StatusOK, html)
}

// replacePlaceholders replaces {{placeholder}} with actual wedding data
func replacePlaceholders(html string, info *models.WeddingInfo, order *models.Order) string {
	replacements := map[string]string{
		// Couple info
		"{{groom_name}}":    info.GroomName,
		"{{bride_name}}":    info.BrideName,
		"{{groom_parent}}":  info.GroomParent,
		"{{bride_parent}}":  info.BrideParent,

		// Date & time
		"{{wedding_date}}":  func() string {
			if info.WeddingDate != nil {
				return info.WeddingDate.Format("02/01/2006")
			}
			return ""
		}(),
		"{{wedding_time}}":  info.WeddingTime,
		"{{reception_time}}": "11:00",
		"{{wedding_date_iso}}": func() string {
			if info.WeddingDate != nil {
				return info.WeddingDate.Format("2006-01-02") + "T" + func() string {
					if info.WeddingTime != "" { return info.WeddingTime }
					return "09:00"
				}() + ":00+07:00"
			}
			return ""
		}(),

		// Venue
		"{{ceremony_venue}}":  info.CeremonyVenue,
		"{{reception_venue}}": info.ReceptionVenue,
		"{{venue_address}}":   info.VenueAddress,
		"{{maps_embed_url}}":  info.MapsEmbedURL,

		// Description
		"{{event_description}}": info.EventDescription,

		// Order info
		"{{custom_domain}}":  order.CustomDomain,
		"{{published_url}}":  order.PublishedURL,
	}

	result := html
	for placeholder, value := range replacements {
		result = strings.ReplaceAll(result, placeholder, value)
	}

	// Handle JSON fields
	result = replaceGallery(result, info)
	result = replaceBankAccounts(result, info)
	result = replaceGuestBookConfig(result, info)
	result = replaceRSVPConfig(result, info)

	return result
}



func replaceGallery(html string, info *models.WeddingInfo) string {
	if info.GalleryURLs == nil {
		return strings.ReplaceAll(html, "{{gallery_urls}}", "[]")
	}
	var urls []string
	json.Unmarshal(info.GalleryURLs, &urls)

	// Build gallery HTML
	var galleryHTML strings.Builder
	for _, url := range urls {
		galleryHTML.WriteString(fmt.Sprintf(`<div class="gallery-item"><img src="%s" alt="Ảnh cưới" loading="lazy" /></div>`, url))
	}
	html = strings.ReplaceAll(html, "{{gallery_html}}", galleryHTML.String())

	jsonBytes, _ := json.Marshal(urls)
	html = strings.ReplaceAll(html, "{{gallery_urls}}", string(jsonBytes))
	return html
}

func replaceBankAccounts(html string, info *models.WeddingInfo) string {
	if info.BankAccounts == nil {
		html = strings.ReplaceAll(html, "{{bank_accounts_html}}", "")
		html = strings.ReplaceAll(html, "{{bank_accounts}}", "[]")
		return html
	}

	type BankAccount struct {
		Bank    string `json:"bank"`
		Account string `json:"account"`
		Name    string `json:"name"`
	}
	var accounts []BankAccount
	json.Unmarshal(info.BankAccounts, &accounts)

	var bankHTML strings.Builder
	for _, acc := range accounts {
		bankHTML.WriteString(fmt.Sprintf(`
		<div class="bank-card">
			<p class="bank-name">%s</p>
			<p class="bank-account">%s</p>
			<p class="bank-holder">%s</p>
		</div>`, acc.Bank, acc.Account, acc.Name))
	}
	html = strings.ReplaceAll(html, "{{bank_accounts_html}}", bankHTML.String())

	jsonBytes, _ := json.Marshal(accounts)
	html = strings.ReplaceAll(html, "{{bank_accounts}}", string(jsonBytes))
	return html
}

func replaceGuestBookConfig(html string, info *models.WeddingInfo) string {
	if info.GuestBookConfig == nil {
		return strings.ReplaceAll(html, "{{guest_book_enabled}}", "false")
	}
	var cfg map[string]interface{}
	json.Unmarshal(info.GuestBookConfig, &cfg)
	if enabled, ok := cfg["enabled"].(bool); ok && enabled {
		return strings.ReplaceAll(html, "{{guest_book_enabled}}", "true")
	}
	return strings.ReplaceAll(html, "{{guest_book_enabled}}", "false")
}

func replaceRSVPConfig(html string, info *models.WeddingInfo) string {
	if info.RSVPConfig == nil {
		return strings.ReplaceAll(html, "{{rsvp_enabled}}", "false")
	}
	var cfg map[string]interface{}
	json.Unmarshal(info.RSVPConfig, &cfg)
	if enabled, ok := cfg["enabled"].(bool); ok && enabled {
		return strings.ReplaceAll(html, "{{rsvp_enabled}}", "true")
	}
	return strings.ReplaceAll(html, "{{rsvp_enabled}}", "false")
}

func renderErrorPage(title, message string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>%s — JunTech</title>
<style>
body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#F5EAE0;color:#3D1010;text-align:center}
h1{font-size:24px;margin-bottom:8px}
p{font-size:16px;color:#6B6B6B}
a{color:#8B1A1A;text-decoration:none;margin-top:20px;display:inline-block}
</style>
</head>
<body>
<div>
<h1>%s</h1>
<p>%s</p>
<a href="/">Về trang chủ JunTech</a>
</div>
</body>
</html>`, title, title, message)
}
