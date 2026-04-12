Dưới đây là mô tả chính xác layout của video thiệp cưới, bao gồm HTML, CSS và vị trí hình ảnh cho từng phần theo thứ tự xuất hiện:

---

### A) MÀN HÌNH COVER (trước khi bấm "Mở thiệp")

**Mô tả tổng thể:** Một màn hình nền màu đỏ đô đậm, ở giữa là một card thiệp màu kem nhạt với các họa tiết phượng hoàng và hoa văn.

**1. EXACT CSS:**
*   **`.cover-container` (toàn bộ màn hình):**
    ```css
    .cover-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: #5F191D; /* Màu đỏ đô đậm */
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        z-index: 100; /* Đảm bảo nó che phủ mọi thứ */
        transition: opacity 0.5s ease-out; /* Hiệu ứng đóng thiệp */
    }
    .cover-container.hidden {
        opacity: 0;
        pointer-events: none; /* Ngăn chặn tương tác sau khi ẩn */
    }
    ```
*   **`.wedding-card` (card thiệp ở giữa):**
    ```css
    .wedding-card {
        position: relative;
        width: 700px; /* Ước tính */
        height: 450px; /* Ước tính */
        background-color: #F8F2ED; /* Màu kem nhạt */
        border-radius: 15px; /* Bo góc */
        padding: 40px; /* Padding bên trong */
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); /* Đổ bóng nhẹ */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        overflow: hidden; /* Quan trọng để cắt hình hoa văn */
        z-index: 10;
        transform: scale(1);
        transition: transform 0.3s ease-in-out;
    }
    .wedding-card:hover {
        transform: scale(1.01); /* Hiệu ứng nhỏ khi hover */
    }
    ```
*   **`.phoenix-left`, `.phoenix-right` (phượng hoàng):**
    *   Phượng hoàng nam NGOÀI card, một phần bị card che khuất.
    ```css
    .phoenix-left {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 400px; /* Ước tính kích thước */
        transform: translate(-100%, -50%) translateX(-200px); /* Đẩy sang trái, căn giữa dọc */
        opacity: 1; /* Độ mờ toàn phần */
        z-index: 5; /* Nằm dưới card */
        /* background-image: url('path/to/phoenix-left.png'); Tưởng tượng có file ảnh */
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
        filter: invert(15%) sepia(20%) saturate(2000%) hue-rotate(330deg) brightness(80%) contrast(100%); /* Để có màu đỏ đô */
    }
    .phoenix-right {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 400px; /* Ước tính kích thước */
        transform: translate(0, -50%) translateX(200px); /* Đẩy sang phải, căn giữa dọc */
        opacity: 1; /* Độ mờ toàn phần */
        z-index: 5; /* Nằm dưới card */
        /* background-image: url('path/to/phoenix-right.png'); */
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
        filter: invert(15%) sepia(20%) saturate(2000%) hue-rotate(330deg) brightness(80%) contrast(100%); /* Để có màu đỏ đô */
    }
    ```
*   **`.floral-corner-bottom-left`, `.floral-corner-bottom-right` (hoa văn):**
    *   Hoa ở góc dưới của card.
    ```css
    .floral-corner-bottom-left {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 150px; /* Ước tính */
        height: 150px; /* Ước tính */
        background-image: url('path/to/flower-bottom-left.png'); /* Tưởng tượng có file ảnh */
        background-size: contain;
        background-repeat: no-repeat;
        opacity: 1;
        z-index: 11; /* Nằm trên nội dung chữ nếu cần */
        filter: invert(15%) sepia(20%) saturate(2000%) hue-rotate(330deg) brightness(80%) contrast(100%); /* Để có màu đỏ đô */
    }
    .floral-corner-bottom-right {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 150px; /* Ước tính */
        height: 150px; /* Ước tính */
        background-image: url('path/to/flower-bottom-right.png'); /* Tưởng tượng có file ảnh */
        background-size: contain;
        background-repeat: no-repeat;
        opacity: 1;
        z-index: 11;
        filter: invert(15%) sepia(20%) saturate(2000%) hue-rotate(330deg) brightness(80%) contrast(100%); /* Để có màu đỏ đô */
    }
    ```
*   **`.couple-name`:**
    ```css
    .couple-name {
        font-family: 'Times New Roman', serif; /* Ước tính */
        font-size: 38px; /* Kích thước chữ */
        color: #5F191D; /* Màu đỏ đô đậm */
        font-weight: bold; /* In đậm */
        margin: 0;
        letter-spacing: 1.5px;
    }
    .ampersand {
        font-family: 'Times New Roman', serif; /* Ước tính */
        font-size: 28px; /* Kích thước chữ */
        color: #5F191D; /* Màu đỏ đô đậm */
        margin: 5px 0;
    }
    .wedding-date {
        font-family: 'Times New Roman', serif; /* Ước tính */
        font-size: 18px; /* Kích thước chữ */
        color: #5F191D; /* Màu đỏ đô đậm */
        margin-top: 15px;
    }
    .invitation-text {
        font-family: 'Times New Roman', serif; /* Ước tính */
        font-size: 16px; /* Kích thước chữ */
        color: #5F191D; /* Màu đỏ đô đậm */
        margin-top: 20px;
        line-height: 1.5;
    }
    .open-button {
        width: 150px; /* Ước tính */
        height: 45px; /* Ước tính */
        background-color: #5F191D; /* Màu đỏ đô đậm */
        color: #F8F2ED; /* Màu chữ kem nhạt */
        border: none;
        border-radius: 25px; /* Bo góc tròn */
        font-family: 'Times New Roman', serif; /* Ước tính */
        font-size: 18px; /* Kích thước chữ */
        cursor: pointer;
        margin-top: 30px;
        transition: background-color 0.3s ease, transform 0.3s ease;
    }
    .open-button:hover {
        background-color: #8C2B30; /* Màu đỏ đậm hơn khi hover */
        transform: translateY(-2px); /* Nâng nút lên nhẹ */
    }
    ```

**2. EXACT HTML structure:**
```html
<div class="cover-container">
    <div class="wedding-card">
        <div class="floral-corner-bottom-left"></div>
        <div class="floral-corner-bottom-right"></div>
        <h1 class="couple-name">NGỌC ÁNH</h1>
        <p class="ampersand">&</p>
        <h1 class="couple-name">THẾ BẢO</h1>
        <p class="wedding-date">3 tháng 5, 2026</p>
        <p class="invitation-text">Thân Mời</p>
        <p class="invitation-text">Gia đình Anh Mạnh</p>
        <p class="invitation-text">Kính mời quý khách đến dự tiệc chung vui cùng gia đình</p>
        <button class="open-button">Mở thiệp</button>
    </div>
    <!-- Các hình phượng hoàng được đặt sau card để chúng nằm dưới card -->
    <img src="path/to/phoenix-left.png" alt="Phoenix Left" class="phoenix-left" style="filter: invert(15%) sepia(20%) saturate(2000%) hue-rotate(330deg) brightness(80%) contrast(100%);">
    <img src="path/to/phoenix-right.png" alt="Phoenix Right" class="phoenix-right" style="filter: invert(15%) sepia(20%) saturate(2000%) hue-rotate(330deg) brightness(80%) contrast(100%);">
</div>
```

**3. EXACT image placement:**
*   **Phượng hoàng (Phoenix):**
    *   Nam NGOÀI card, một con bên trái, một con bên phải.
    *   `width: 400px` (ước tính).
    *   `top: 50%`, `left: 50%` của `.cover-container` sau đó `transform` để dịch chuyển chúng ra hai bên.
    *   `opacity: 1`.
    *   Màu: Đỏ đô (giống màu nền) qua `filter: invert(...)` hoặc ảnh PNG đã có màu.
    *   `z-index: 5` (dưới `.wedding-card`).
*   **Hoa (Floral corners):**
    *   Nam TRONG `.wedding-card`.
    *   `bottom: 0`, `left: 0` cho hoa bên trái, `bottom: 0`, `right: 0` cho hoa bên phải.
    *   `width: 150px`, `height: 150px` (ước tính).
    *   `opacity: 1`.
    *   Màu: Đỏ đô (giống màu nền) qua `filter: invert(...)` hoặc ảnh PNG đã có màu.
    *   `z-index: 11` (trên nền card).

---

### B) TRANG SAU KHI MỞ (trang lớn với chữ Hỷ)

**Mô tả tổng thể:** Trang cuộn với nền màu kem nhạt, có các họa tiết phượng hoàng và hoa văn mờ ở các cạnh. Phía trên có tên cô dâu chú rể, chữ Hỷ lớn màu trắng đặt trên dải băng đỏ.

**1. EXACT CSS:**
*   **`.main-wedding-page` (toàn bộ nội dung sau khi mở thiệp):**
    ```css
    .main-wedding-page {
        background-color: #F8F2ED; /* Màu kem nhạt */
        font-family: 'Times New Roman', serif; /* Font chữ chung */
        color: #5F191D; /* Màu chữ đỏ đô chung */
        padding-bottom: 50px; /* Khoảng trống cuối trang */
        overflow-x: hidden; /* Ngăn cuộn ngang */
        position: relative;
    }
    /* Họa tiết nền toàn trang */
    .main-wedding-page::before { /* Phượng hoàng trái */
        content: '';
        position: absolute;
        top: 0;
        left: -100px; /* Điều chỉnh vị trí */
        width: 600px; /* Kích thước lớn */
        height: 100%; /* Chiều cao toàn trang */
        background-image: url('path/to/phoenix-left-faded.png'); /* Ảnh phượng hoàng mờ */
        background-repeat: no-repeat;
        background-size: contain;
        background-position: top left;
        opacity: 0.15; /* Rất mờ */
        z-index: 1;
        transform: rotateY(180deg); /* Lật hình cho hợp lý */
        filter: invert(15%) sepia(20%) saturate(2000%) hue-rotate(330deg) brightness(80%) contrast(100%); /* Đ��� có màu đỏ đô mờ */
    }
    .main-wedding-page::after { /* Phượng hoàng phải */
        content: '';
        position: absolute;
        top: 0;
        right: -100px; /* Điều chỉnh vị trí */
        width: 600px; /* Kích thước lớn */
        height: 100%;
        background-image: url('path/to/phoenix-right-faded.png'); /* Ảnh phượng hoàng mờ */
        background-repeat: no-repeat;
        background-size: contain;
        background-position: top right;
        opacity: 0.15; /* Rất mờ */
        z-index: 1;
        filter: invert(15%) sepia(20%) saturate(2000%) hue-rotate(330deg) brightness(80%) contrast(100%); /* Để có màu đỏ đô mờ */
    }

    /* Hoa văn góc dưới phải của trang */
    .main-wedding-page .bottom-right-floral {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 300px; /* Ước tính kích thước */
        height: 300px; /* Ước tính kích thước */
        background-image: url('path/to/floral-pattern.png'); /* Tưởng tượng ảnh hoa văn */
        background-size: contain;
        background-repeat: no-repeat;
        opacity: 0.1; /* Rất mờ */
        z-index: 1;
        filter: invert(15%) sepia(20%) saturate(2000%) hue-rotate(330deg) brightness(80%) contrast(100%); /* Để có màu đỏ đô mờ */
    }

    .header-section {
        position: relative;
        text-align: center;
        padding-top: 50px;
        padding-bottom: 30px;
        z-index: 2; /* Đảm bảo nội dung nằm trên họa tiết nền */
    }
    .header-couple-name {
        font-family: 'Times New Roman', serif;
        font-size: 48px; /* Lớn hơn */
        color: #5F191D;
        font-weight: bold;
        margin: 0;
    }
    .header-ampersand {
        font-family: 'Times New Roman', serif;
        font-size: 36px;
        color: #5F191D;
        margin: 10px 0;
    }
    .red-banner {
        width: 100%; /* Chiều rộng toàn bộ */
        height: 120px; /* Chiều cao dải băng */
        background-color: #5F191D; /* Màu đỏ đô đậm */
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 20px; /* Khoảng cách với tên */
        position: relative;
    }
    .hy-character {
        font-size: 100px; /* Ước tính kích thước */
        color: #F8F2ED; /* Màu trắng kem nhạt */
        /* Chữ Hỷ là một hình ảnh SVG hoặc font đặc biệt */
        /* background-image: url('path/to/hy-character.svg'); */
        /* background-size: contain; */
        /* background-repeat: no-repeat; */
        /* width: 150px; height: 100px; */
        /* position: absolute; */
        /* top: 50%; left: 50%; transform: translate(-50%, -50%); */
    }
    ```

**2. EXACT HTML structure:**
```html
<div class="main-wedding-page">
    <audio controls autoplay loop style="display:none;">
        <source src="path/to/wedding-music.mp3" type="audio/mpeg">
        Your browser does not support the audio element.
    </audio>
    <div class="bottom-right-floral"></div> <!-- Hoa văn góc dưới phải -->

    <div class="header-section">
        <h1 class="header-couple-name">NGỌC ÁNH</h1>
        <p class="header-ampersand">&</p>
        <h1 class="header-couple-name">THẾ BẢO</h1>
        <div class="red-banner">
            <!-- Chữ Hỷ ở đây thường là một SVG hoặc font icon đặc biệt -->
            <img src="path/to/hy-character.svg" alt="Chữ Hỷ" class="hy-character">
        </div>
    </div>
    <!-- Tiếp tục các section khác của trang -->
</div>
```

**3. EXACT image placement:**
*   **Phượng hoàng (Phoenix) nền:**
    *   Où: Là `background-image` cho pseudo-elements `::before` (trái) và `::after` (phải) c���a `.main-wedding-page`.
    *   `width: 600px` (ước tính).
    *   `top: 0`, `left: -100px` (phượng hoàng trái), `top: 0`, `right: -100px` (phượng hoàng phải).
    *   `opacity: 0.15` (rất mờ).
    *   Màu: Đỏ đô mờ (qua `filter` CSS hoặc ảnh PNG đã mờ sẵn).
    *   `z-index: 1`.
*   **Chữ Hỷ:**
    *   Où: Nam TRONG dải băng đỏ (`.red-banner`).
    *   `font-size: 100px` nếu là font, hoặc `width: 150px` (ước tính) nếu là hình ảnh SVG.
    *   Màu: Trắng kem nhạt (`#F8F2ED`).
    *   Vị trí: Căn giữa hoàn toàn trong dải băng đỏ.
*   **Dải đỏ ngang:**
    *   Où: Một `div` với `background-color` đỏ đô, nằm ngang, dưới tên cô dâu chú rể.
    *   `height: 120px` (ước tính).
    *   `width: 100%`.
    *   `position: relative` để chứa chữ Hỷ.
*   **Hoa (Floral pattern):**
    *   Où: Một `div` với `background-image` cho hoa văn góc dưới phải của toàn trang.
    *   `bottom: 0`, `right: 0` của `.main-wedding-page`.
    *   `width: 300px`, `height: 300px` (ước tính).
    *   `opacity: 0.1` (rất mờ).
    *   Màu: Đỏ đô mờ (qua `filter` CSS hoặc ảnh PNG đã mờ sẵn).
    *   `z-index: 1`.

---

### C) THÔNG TIN GIA ĐÌNH

**Mô tả tổng thể:** Tiêu đề "THÔNG TIN LỄ CƯỚI" ở trên, sau đó là hai cột thông tin gia đình cô dâu và chú rể.

**1. EXACT CSS:**
```css
.section-title {
    font-family: 'Times New Roman', serif;
    font-size: 24px; /* Kích thước tiêu đề */
    color: #5F191D;
    text-align: center;
    text-transform: uppercase; /* Viết hoa */
    margin-top: 50px;
    margin-bottom: 30px;
    letter-spacing: 1px;
}
.family-info-container {
    display: flex;
    justify-content: center; /* Căn giữa 2 cột */
    gap: 80px; /* Khoảng cách giữa 2 cột */
    padding: 0 50px; /* Padding hai bên */
    max-width: 900px; /* Giới hạn chiều rộng */
    margin: 0 auto;
}
.family-column {
    flex: 1; /* Mỗi cột chiếm một phần bằng nhau */
    text-align: center;
    padding: 20px;
}
.family-column p {
    font-family: 'Times New Roman', serif;
    color: #5F191D;
    margin: 5px 0;
    line-height: 1.6;
}
.family-column .role {
    font-size: 18px; /* Chữ "Ông Bà" */
    font-weight: bold;
    margin-bottom: 10px;
}
.family-column .name {
    font-size: 16px; /* Tên bố mẹ */
    font-weight: bold;
}
.family-column .address {
    font-size: 14px; /* Địa chỉ */
    opacity: 0.8;
}
```

**2. EXACT HTML structure:**
```html
<h2 class="section-title">THÔNG TIN LỄ CƯỚI</h2>
<div class="family-info-container">
    <div class="family-column">
        <p class="role">Ông Bà</p>
        <p class="name">Lê Văn Khoa</p>
        <p class="name">Phạm Thị Kim Oanh</p>
        <p class="address">236 Lê Lợi, Quận 1, TP Hồ Chí Minh</p>
    </div>
    <div class="family-column">
        <p class="role">Ông Bà</p>
        <p class="name">Trần Văn Tuấn</p>
        <p class="name">Lý Thị Hương</p>
        <p class="address">123 Nguyễn Huệ, Quận 1, TP Hồ Chí Minh</p>
    </div>
</div>
```

**3. EXACT image placement:** Không có hình ảnh cụ thể trong phần này, chỉ có text.

---

### D) TÊN CÔ DÂU CHÚ RỂ LỚN

**Mô tả tổng thể:** Tên cô dâu và chú rể được hiển thị lớn hơn, kèm theo nhãn "ÚT NỮ" và "ÚT NAM" nhỏ hơn.

**1. EXACT CSS:**
```css
.couple-names-large {
    text-align: center;
    margin-top: 40px;
    margin-bottom: 40px;
}
.couple-names-large .name-main {
    font-family: 'Times New Roman', serif; /* Ước tính font script hoặc serif */
    font-size: 48px; /* Kích thước tên chính */
    color: #5F191D;
    font-weight: bold;
    margin: 0;
    line-height: 1.2;
}
.couple-names-large .label-sub {
    font-family: 'Times New Roman', serif;
    font-size: 16px; /* Kích thước nhãn */
    color: #5F191D;
    margin: 5px 0 15px 0; /* Khoảng cách giữa nhãn và tên tiếp theo */
    opacity: 0.9;
}
.couple-names-large .ampersand-large {
    font-family: 'Times New Roman', serif;
    font-size: 36px;
    color: #5F191D;
    margin: 15px 0;
}
```

**2. EXACT HTML structure:**
```html
<div class="couple-names-large">
    <p class="name-main">Lê Ngọc Ánh</p>
    <p class="label-sub">ÚT NỮ</p>
    <p class="ampersand-large">&</p>
    <p class="name-main">Trần Thế Bảo</p>
    <p class="label-sub">ÚT NAM</p>
</div>
```

**3. EXACT image placement:** Không có hình ảnh.

---

### E) LỄ CƯỚI

**Mô tả tổng thể:** Phần album ảnh cưới và thông tin chi tiết về buổi tiệc cưới.

**1. EXACT CSS:**
```css
.wedding-album-section {
    margin-top: 50px;
    text-align: center;
}
.wedding-album-section .section-title { /* Dùng lại style section-title */
    margin-bottom: 30px;
}
.photo-grid {
    display: grid;
    grid-template-columns: repeat(2, 280px); /* 2 cột, mỗi cột 280px */
    gap: 20px; /* Khoảng cách giữa các ảnh */
    justify-content: center; /* Căn giữa grid */
    margin-bottom: 50px;
}
.photo-item {
    width: 280px; /* Chiều rộng ảnh */
    height: 280px; /* Chiều cao ảnh */
    border-radius: 10px; /* Bo góc ảnh */
    overflow: hidden;
    position: relative;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); /* Đổ bóng nhẹ */
    cursor: pointer;
}
.photo-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
}
.photo-item:hover img {
    transform: scale(1.05); /* Hiệu ứng zoom nhẹ khi hover */
}
.photo-item.more-photos::before { /* Lớp phủ cho ảnh thứ 4 */
    content: '+2'; /* Văn bản */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Nền tối hơn */
    color: #F8F2ED;
    font-family: 'Times New Roman', serif;
    font-size: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0; /* Mặc định ẩn */
    transition: opacity 0.3s ease;
}
.photo-item.more-photos:hover::before {
    opacity: 1; /* Hiển thị khi hover */
}

.wedding-schedule-section {
    text-align: center;
    margin-top: 50px;
}
.wedding-schedule-section .section-title {
    margin-bottom: 30px;
}
.schedule-time {
    font-family: 'Times New Roman', serif;
    font-size: 48px; /* Kích thước giờ chính */
    color: #5F191D;
    font-weight: bold;
    margin: 20px 0 10px 0;
}
.schedule-date {
    font-family: 'Times New Roman', serif;
    font-size: 20px; /* Kích thước ngày */
    color: #5F191D;
    margin: 5px 0;
}
.schedule-lunar-date {
    font-family: 'Times New Roman', serif;
    font-size: 16px; /* Kích thước ngày âm lịch */
    color: #5F191D;
    opacity: 0.8;
    margin-bottom: 30px;
}
.reception-times {
    display: flex;
    justify-content: center;
    gap: 40px; /* Khoảng cách giữa Đón khách và Khai tiệc */
    margin-top: 20px;
}
.reception-times div {
    font-family: 'Times New Roman', serif;
    font-size: 18px;
    color: #5F191D;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.reception-times .time-value {
    font-weight: bold;
    font-size: 20px;
    margin-top: 5px;
}
```

**2. EXACT HTML structure:**
```html
<div class="wedding-album-section">
    <h2 class="section-title">ALBUM ẢNH CƯỚI</h2>
    <div class="photo-grid">
        <div class="photo-item"><img src="path/to/wedding-photo-1.jpg" alt="Wedding Photo 1"></div>
        <div class="photo-item"><img src="path/to/wedding-photo-2.jpg" alt="Wedding Photo 2"></div>
        <div class="photo-item"><img src="path/to/wedding-photo-3.jpg" alt="Wedding Photo 3"></div>
        <div class="photo-item more-photos"><img src="path/to/wedding-photo-4.jpg" alt="Wedding Photo 4"></div>
    </div>
</div>

<div class="wedding-schedule-section">
    <h2 class="section-title">TIỆC CƯỚI SẼ DIỄN RA VÀO LÚC:</h2>
    <p class="schedule-time">18:00</p>
    <p class="schedule-date">CHỦ NHẬT 03 THÁNG 05</p>
    <p class="schedule-date">2026</p>
    <p class="schedule-lunar-date">(Tức ngày 17/03 Bính Ngọ)</p>
    <div class="reception-times">
        <div>
            <span>ĐÓN KHÁCH</span>
            <span class="time-value">17:30</span>
        </div>
        <div>
            <span>KHAI TIỆC</span>
            <span class="time-value">18:00</span>
        </div>
    </div>
</div>
```

**3. EXACT image placement:**
*   **Ảnh album cưới:**
    *   Où: 4 ảnh trong một lưới 2x2.
    *   `width: 280px`, `height: 280px` (ước tính, hình vuông).
    *   Bo góc `border-radius: 10px`.
    *   Ảnh thứ 4 có lớp phủ `+2` khi hover.

---

### F) ĐẾM NGƯỢC

**Mô tả tổng thể:** Phần hiển thị đồng hồ đếm ngược đến ngày cưới, kèm nút xác nhận tham dự.

**1. EXACT CSS:**
```css
.countdown-section {
    text-align: center;
    margin-top: 60px;
    padding-bottom: 50px;
}
.countdown-section .section-title {
    margin-bottom: 30px;
}
.countdown-timer {
    font-family: 'Times New Roman', serif;
    font-size: 28px; /* Kích thước chữ đếm ngược */
    color: #5F191D;
    font-weight: bold;
    margin-bottom: 20px;
}
.add-to-calendar-link {
    font-family: 'Times New Roman', serif;
    font-size: 16px;
    color: #5F191D;
    text-decoration: underline;
    cursor: pointer;
    margin-bottom: 30px;
    display: block; /* Để link nằm trên một dòng riêng */
    transition: color 0.3s ease;
}
.add-to-calendar-link:hover {
    color: #8C2B30; /* Đổi màu khi hover */
}
.confirm-button {
    width: 220px; /* Ước tính */
    height: 55px; /* Ước tính */
    background-color: #5F191D;
    color: #F8F2ED;
    border: none;
    border-radius: 30px; /* Bo góc tròn */
    font-family: 'Times New Roman', serif;
    font-size: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
}
.confirm-button:hover {
    background-color: #8C2B30;
    transform: translateY(-2px);
}
```

**2. EXACT HTML structure:**
```html
<div class="countdown-section">
    <h2 class="section-title">CÙNG ĐẾM NGƯỢC</h2>
    <p class="countdown-timer">28 ngày 21 giờ 35 phút 56 giây</p>
    <a href="#" class="add-to-calendar-link">Thêm vào lịch</a>
    <button class="confirm-button">XÁC NHẬN THAM DỰ</button>
</div>
```

**3. EXACT image placement:** Không có hình ảnh.

---

### G) SỔ LƯU BÚT

**Mô tả tổng thể:** Thông tin địa điểm tổ chức tiệc cưới với bản đồ nhúng, sau đó là phần form để gửi lời chúc và danh sách các lời chúc đã có.

**1. EXACT CSS:**
```css
.location-section {
    text-align: center;
    margin-top: 60px;
}
.location-section .section-title {
    margin-bottom: 20px;
}
.location-address {
    font-family: 'Times New Roman', serif;
    font-size: 16px;
    color: #5F191D;
    line-height: 1.5;
    margin-bottom: 30px;
}
.google-map-embed {
    width: 80%; /* Chiếm 80% chiều rộng */
    max-width: 800px; /* Giới hạn chiều rộng tối đa */
    height: 400px; /* Chiều cao cố định */
    border-radius: 10px; /* Bo góc bản đồ */
    border: 1px solid #ddd;
    overflow: hidden; /* Đảm bảo bo góc hoạt động */
    margin: 0 auto 50px auto;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.guestbook-section {
    text-align: center;
    margin-top: 60px;
    padding-bottom: 50px;
}
.guestbook-section .section-title {
    margin-bottom: 30px;
}
.guestbook-form {
    width: 60%; /* Chiều rộng form */
    max-width: 600px; /* Giới hạn chiều rộng tối đa */
    margin: 0 auto 50px auto;
    background-color: #FFF; /* Nền trắng */
    border-radius: 10px;
    padding: 30px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}
.guestbook-form label {
    display: block;
    text-align: left;
    font-family: 'Times New Roman', serif;
    font-size: 16px;
    color: #5F191D;
    margin-bottom: 8px;
}
.guestbook-form input[type="text"],
.guestbook-form textarea {
    width: calc(100% - 20px); /* Đảm bảo padding không làm tràn */
    padding: 12px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-family: 'Times New Roman', serif;
    font-size: 16px;
    color: #333;
    resize: vertical; /* Cho phép thay đổi kích thước theo chiều dọc */
}
.guestbook-form textarea {
    min-height: 100px;
}
.guestbook-form button {
    width: 150px;
    height: 45px;
    background-color: #5F191D;
    color: #F8F2ED;
    border: none;
    border-radius: 25px;
    font-family: 'Times New Roman', serif;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
}
.guestbook-form button:hover {
    background-color: #8C2B30;
    transform: translateY(-2px);
}

.comment-list {
    width: 60%; /* Chiều rộng danh sách lời chúc */
    max-width: 600px;
    margin: 0 auto;
}
.comment-card {
    background-color: #FDF4F4; /* Nền hồng nhạt/kem */
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
    text-align: left;
}
.comment-card .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 10px;
}
.comment-card .comment-name {
    font-family: 'Times New Roman', serif;
    font-size: 18px;
    color: #5F191D;
    font-weight: bold;
}
.comment-card .comment-date {
    font-family: 'Times New Roman', serif;
    font-size: 13px;
    color: #777;
    opacity: 0.8;
}
.comment-card .comment-message {
    font-family: 'Times New Roman', serif;
    font-size: 16px;
    color: #333;
    line-height: 1.6;
}
```

**2. EXACT HTML structure:**
```html
<div class="location-section">
    <h2 class="section-title">TIỆC CƯỚI SẼ TỔ CHỨC TẠI</h2>
    <p class="location-address">White Palace Convention Center, 194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, Hồ Chí Minh</p>
    <div class="google-map-embed">
        <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.064032742915!2d106.6661446750379!3d10.80665788934442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175292c30b20501%3A0x6a0a09e0a0a0a0a0!2sWhite%20Palace%20Hoang%20Van%20Thu!5e0!3m2!1sen!2s-VN!4v1678901234567!5m2!1sen!2s-VN"
            width="100%"
            height="100%"
            style="border:0;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
        </iframe>
    </div>
</div>

<div class="guestbook-section">
    <h2 class="section-title">Sổ lưu bút</h2>
    <div class="guestbook-form">
        <input type="text" placeholder="Tên của bạn" aria-label="Tên của bạn">
        <textarea placeholder="Để lại lời chúc của bạn" aria-label="Lời chúc"></textarea>
        <button>GỬI LỜI CHÚC</button>
    </div>
    <div class="comment-list">
        <div class="comment-card">
            <div class="comment-header">
                <span class="comment-name">Kế</span>
                <span class="comment-date">22:37 01/01/2025</span>
            </div>
            <p class="comment-message">Chúc Thế Bảo và Ngọc Ánh luôn khỏe mạnh, bình an và hạnh phúc. Đừng quên mau chóng đón thêm những thành viên mới là Mi Duệ!</p>
        </div>
        <div class="comment-card">
            <div class="comment-header">
                <span class="comment-name">Ngọc Quyên</span>
                <span class="comment-date">10:07 10/12/2025</span>
            </div>
            <p class="comment-message">Chúc hai bạn luôn nắm tay nhau qua mọi chặng đường.</p>
        </div>
        <div class="comment-card">
            <div class="comment-header">
                <span class="comment-name">Chi Tâm</span>
                <span class="comment-date">10:05 10/12/2025</span>
            </div>
            <p class="comment-message">Chúc mừng hạnh phúc của công chúa và thẻ.</p>
        </div>
        <div class="comment-card">
            <div class="comment-header">
                <span class="comment-name">Phúc Hân</span>
                <span class="comment-date">17:03 09/12/2025</span>
            </div>
            <p class="comment-message">Kính chúc tân lang tân nương trăm năm hạnh phúc 🥰</p>
        </div>
        <div class="comment-card">
            <div class="comment-header">
                <span class="comment-name">Bách Gia Huy</span>
                <span class="comment-date">10:00 04/12/2025</span>
            </div>
            <p class="comment-message">Chúc đôi bạn mãi mãi viên mãn và vững bền!</p>
        </div>
        <div class="comment-card">
            <div class="comment-header">
                <span class="comment-name">Linh</span>
                <span class="comment-date">17:03 01/12/2025</span>
            </div>
            <p class="comment-message">Happy Wedding</p>
        </div>
    </div>
</div>
```

**3. EXACT image placement:**
*   **Bản đồ Google Maps:**
    *   Où: Là một `iframe` được nhúng, căn giữa trang.
    *   `width: 80%` (`max-width: 800px`), `height: 400px`.
    *   Bo góc `border-radius: 10px`.

---

### H) MỪNG CƯỚI

**Mô tả tổng thể:** Hai mã QR code để mừng cưới, kèm thông tin ngân hàng và nút sao chép, cuối cùng là lời cảm ơn.

**1. EXACT CSS:**
```css
.gift-section {
    text-align: center;
    margin-top: 60px;
    padding-bottom: 80px; /* Padding dưới cùng trang */
}
.gift-section .section-title {
    margin-bottom: 30px;
}
.qr-codes-container {
    display: flex;
    justify-content: center;
    gap: 50px; /* Khoảng cách giữa 2 QR code */
    margin-bottom: 50px;
    flex-wrap: wrap; /* Cho phép xuống dòng trên màn hình nhỏ */
}
.qr-code-card {
    background-color: #FFF;
    border-radius: 10px;
    padding: 30px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    width: 280px; /* Chiều rộng card QR */
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}
.qr-code-card .label {
    font-family: 'Times New Roman', serif;
    font-size: 18px;
    color: #5F191D;
    font-weight: bold;
    margin-bottom: 15px;
}
.qr-code-card img {
    width: 180px; /* Kích thước QR code */
    height: 180px;
    border: 1px solid #eee; /* Đường viền nhẹ */
    border-radius: 5px;
    margin-bottom: 15px;
}
.qr-code-card .bank-info {
    font-family: 'Times New Roman', serif;
    font-size: 14px;
    color: #333;
    line-height: 1.5;
    margin-bottom: 15px;
}
.qr-code-card .copy-button {
    background-color: #EFEFEF; /* Nền xám nhạt */
    color: #5F191D;
    border: 1px solid #ccc;
    border-radius: 20px;
    padding: 8px 18px;
    font-family: 'Times New Roman', serif;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}
.qr-code-card .copy-button:hover {
    background-color: #DDD;
}
.closing-remark {
    font-family: 'Times New Roman', serif;
    font-size: 18px;
    color: #5F191D;
    margin-top: 40px;
    line-height: 1.6;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}
```

**2. EXACT HTML structure:**
```html
<div class="gift-section">
    <h2 class="section-title">Hộp Mừng Cưới</h2>
    <div class="qr-codes-container">
        <div class="qr-code-card">
            <p class="label">CÔ DÂU - Ngọc Ánh</p>
            <img src="path/to/qr-code-ngoc-anh.png" alt="QR Code Ngọc Ánh">
            <div class="bank-info">
                <p>Vietcombank</p>
                <p>1234567890</p>
                <p>LE NGOC ANH</p>
            </div>
            <button class="copy-button">Sao chép</button>
        </div>
        <div class="qr-code-card">
            <p class="label">CHÚ RỂ - Thế Bảo</p>
            <img src="path/to/qr-code-the-bao.png" alt="QR Code Thế Bảo">
            <div class="bank-info">
                <p>Vietcombank</p>
                <p>0987654321</p>
                <p>TRAN THE BAO</p>
            </div>
            <button class="copy-button">Sao chép</button>
        </div>
    </div>
    <p class="closing-remark">Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!</p>
</div>
```

**3. EXACT image placement:**
*   **QR codes:**
    *   Où: 2 ảnh QR code, đặt cạnh nhau trong `.qr-codes-container`.
    *   `width: 180px`, `height: 180px` (ước tính).
    *   Mỗi QR code nằm trong một card riêng, kèm label và thông tin ngân hàng.

---
**Lưu ý:**
*   Các giá trị pixel (width, height, font-size, padding, margin) là ước tính dựa trên quan sát video. Trong thực tế, cần điều chỉnh để phù hợp với các kích thước màn hình và độ phân giải khác nhau.
*   `font-family: 'Times New Roman', serif;` được dùng làm ước tính cho các font chữ serif trang nhã. Trong một dự án thực tế, bạn sẽ cần sử dụng các font được nhúng (Google Fonts, Typekit, v.v.) để đảm bảo hiển thị đồng nhất.
*   Màu sắc được sử dụng là mã hex chính xác lấy từ video bằng công cụ chọn màu.
*   Các đường dẫn ảnh (ví dụ: `path/to/phoenix-left.png`) là placeholder và cần được thay thế bằng đường dẫn thực tế đến các tài nguyên hình ảnh của bạn.
*   `filter: invert(...)` được sử dụng để mô tả cách đổi màu một ảnh trắng/đen sang màu đỏ đô nếu ảnh gốc không có màu. Nếu bạn có ảnh đã có màu, không cần filter này.
*   Nhạc nền được thêm vào với thẻ `<audio>` và thuộc tính `autoplay loop`.