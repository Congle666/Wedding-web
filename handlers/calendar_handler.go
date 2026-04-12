package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"wedding-api/config"
	"wedding-api/models"
	"wedding-api/utils"

	"github.com/gin-gonic/gin"
)

// GenerateICS generates an .ics calendar file for the wedding
// GET /api/wedding/:slug/calendar.ics
func GenerateICS(c *gin.Context) {
	slug := c.Param("slug")

	var order models.Order
	if err := config.DB.
		Where("(custom_domain = ? OR published_url = ?) AND status = 'published'", slug, slug).
		First(&order).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy thiệp cưới")
		return
	}

	var info models.WeddingInfo
	if err := config.DB.Where("order_id = ?", order.ID).First(&info).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "not_found", "Không tìm thấy thông tin cưới")
		return
	}

	if info.WeddingDate == nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "no_date", "Chưa có ngày cưới")
		return
	}

	var events []string

	// Event 1: Lễ gia tiên (if separate ceremony info exists)
	if info.CeremonyTime != "" || info.CeremonyAddress != "" {
		ceremonyTime := info.CeremonyTime
		if ceremonyTime == "" {
			ceremonyTime = info.WeddingTime
		}
		ceremonyLocation := info.CeremonyVenue
		if info.CeremonyAddress != "" {
			ceremonyLocation += ", " + info.CeremonyAddress
		}

		dtStart := formatICSDateTime(*info.WeddingDate, ceremonyTime)
		dtEnd := formatICSDateTime(*info.WeddingDate, addHours(ceremonyTime, 2))

		events = append(events, fmt.Sprintf(
			"BEGIN:VEVENT\r\n"+
				"DTSTART:%s\r\n"+
				"DTEND:%s\r\n"+
				"SUMMARY:Lễ gia tiên %s & %s\r\n"+
				"LOCATION:%s\r\n"+
				"DESCRIPTION:Lễ gia tiên của %s và %s\r\n"+
				"END:VEVENT",
			dtStart, dtEnd,
			info.BrideName, info.GroomName,
			escapeICS(ceremonyLocation),
			info.BrideName, info.GroomName,
		))
	}

	// Event 2: Tiệc cưới (main event)
	receptionTime := info.ReceptionTime
	if receptionTime == "" {
		receptionTime = info.WeddingTime
	}
	receptionLocation := info.ReceptionVenue
	if info.ReceptionAddress != "" {
		receptionLocation += ", " + info.ReceptionAddress
	} else if info.VenueAddress != "" {
		receptionLocation += ", " + info.VenueAddress
	}

	dtStart := formatICSDateTime(*info.WeddingDate, receptionTime)
	dtEnd := formatICSDateTime(*info.WeddingDate, addHours(receptionTime, 3))

	events = append(events, fmt.Sprintf(
		"BEGIN:VEVENT\r\n"+
			"DTSTART:%s\r\n"+
			"DTEND:%s\r\n"+
			"SUMMARY:Tiệc cưới %s & %s\r\n"+
			"LOCATION:%s\r\n"+
			"DESCRIPTION:Tiệc cưới của %s và %s\r\n"+
			"END:VEVENT",
		dtStart, dtEnd,
		info.BrideName, info.GroomName,
		escapeICS(receptionLocation),
		info.BrideName, info.GroomName,
	))

	ics := "BEGIN:VCALENDAR\r\n" +
		"VERSION:2.0\r\n" +
		"PRODID:-//JunTech//Wedding//VI\r\n" +
		"CALSCALE:GREGORIAN\r\n" +
		"METHOD:PUBLISH\r\n" +
		strings.Join(events, "\r\n") + "\r\n" +
		"END:VCALENDAR"

	c.Header("Content-Type", "text/calendar; charset=utf-8")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=wedding-%s.ics", slug))
	c.String(http.StatusOK, ics)
}

func formatICSDateTime(date time.Time, timeStr string) string {
	// Parse time like "09:00" or "17:30"
	hour, min := 9, 0
	if timeStr != "" {
		fmt.Sscanf(timeStr, "%d:%d", &hour, &min)
	}
	dt := time.Date(date.Year(), date.Month(), date.Day(), hour, min, 0, 0, time.Local)
	return dt.UTC().Format("20060102T150405Z")
}

func addHours(timeStr string, hours int) string {
	hour, min := 9, 0
	if timeStr != "" {
		fmt.Sscanf(timeStr, "%d:%d", &hour, &min)
	}
	hour += hours
	if hour >= 24 {
		hour = 23
		min = 59
	}
	return fmt.Sprintf("%02d:%02d", hour, min)
}

func escapeICS(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, ",", "\\,")
	s = strings.ReplaceAll(s, ";", "\\;")
	s = strings.ReplaceAll(s, "\n", "\\n")
	return s
}
