package handlers

import "time"

func parseDateTime(dateStr string) (time.Time, error) {
	// Try full datetime first, then date only
	t, err := time.Parse("2006-01-02 15:04:05", dateStr)
	if err != nil {
		t, err = time.Parse("2006-01-02T15:04:05Z", dateStr)
		if err != nil {
			t, err = time.Parse("2006-01-02", dateStr)
		}
	}
	return t, err
}
