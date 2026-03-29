/*
  story.js — Hiệu ứng scroll cho trang Câu Chuyện (story.html)
  =============================================================
  Hai chức năng chính:

  1. initStoryScrollReveal():
     - Theo dõi vị trí scroll, tính toán "tiến độ" mỗi .reveal-item
       đã đi vào viewport được bao nhiêu phần trăm
     - Cập nhật CSS variable --reveal-x, --reveal-y, --reveal-scale
       theo thời gian thực (dùng lerp — nội suy tuyến tính để mượt)
     - Kết quả: ảnh trượt từ trái/phải vào, chữ trượt từ dưới lên
       khi người dùng cuộn xuống

  2. initStoryHeroParallax():
     - Khi scroll qua vùng hero, dịch chuyển:
       + ảnh nền (heroBg) chậm hơn — cảm giác sâu
       + khung text (heroContent) nhanh hơn ảnh nền — cảm giác nổi
     - Giảm độ trong suốt của content khi scroll → mờ dần tự nhiên
*/

/* Chờ DOM load xong rồi mới chạy các hàm
   DOMContentLoaded: nhanh hơn load (không cần chờ ảnh/font) */
document.addEventListener('DOMContentLoaded', () => {
    initStoryScrollReveal();
    initStoryHeroParallax();
});


/* ====================================================================
   HÀM 1: initStoryScrollReveal
   - Lấy tất cả phần tử .reveal-item
   - Tính --reveal-x/y/scale dựa vào vị trí trong viewport
   - Dùng lerp + requestAnimationFrame để chuyển động mượt
   ==================================================================== */
function initStoryScrollReveal() {

    /* Lấy tất cả phần tử cần hiệu ứng reveal
       querySelectorAll trả về NodeList, không phải Array
       → cần Array.from() bên dưới để dùng .map() */
    const revealItems = document.querySelectorAll('.reveal-item');

    /* Nếu không có phần tử nào → thoát sớm, không làm gì */
    if (!revealItems.length) { return; }

    /* ── Kiểm tra tuỳ chọn giảm chuyển động của hệ điều hành ──
       Người dùng cài đặt "prefers-reduced-motion: reduce" trong OS
       → ta không nên chạy animation → reset hết về 0 và thoát */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        revealItems.forEach((item) => {
            /* Đặt offset về 0 → phần tử hiện đúng vị trí, không bị lệch */
            item.style.setProperty('--reveal-x', '0px');
            item.style.setProperty('--reveal-y', '0px');
            item.style.setProperty('--reveal-scale', '1');
        });
        return; /* Thoát, không gắn event scroll */
    }

    /* ── getOffsetConfig: trả về {x, y} — khoảng lệch ban đầu của mỗi phần tử ──
       Tuỳ kích thước màn hình mà điều chỉnh:
       - Mobile nhỏ: không trượt ngang (tránh overflow ngang)
       - Tablet: trượt ngang nhẹ
       - Desktop: trượt ngang mạnh */
    const getOffsetConfig = (item) => {
        const w = window.innerWidth;

        /* Mobile ≤ 600px: chỉ trượt dọc, không trượt ngang
           (layout lúc này đã 1 cột, trượt ngang sẽ gây overflow) */
        if (w <= 600) {
            if (item.classList.contains('reveal-left') || item.classList.contains('reveal-right')) {
                return { x: 0, y: 30 }; /* ảnh cũng chỉ trượt dọc */
            }
            return { x: 0, y: 36 }; /* chữ */
        }

        /* Tablet dọc ≤ 768px: layout 1 cột nhưng có thể trượt nhẹ ngang */
        if (w <= 768) {
            if (item.classList.contains('reveal-left'))  return { x: -40, y: 14 };
            if (item.classList.contains('reveal-right')) return { x:  40, y: 14 };
            return { x: 0, y: 48 };
        }

        /* Tablet ngang ≤ 992px: vẫn 2 cột, trượt ngang vừa phải */
        if (w <= 992) {
            if (item.classList.contains('reveal-left'))  return { x: -60, y: 16 };
            if (item.classList.contains('reveal-right')) return { x:  60, y: 16 };
            return { x: 0, y: 56 };
        }

        /* Desktop > 992px: trượt ngang mạnh nhất (100px) */
        if (item.classList.contains('reveal-left'))  return { x: -100, y: 18 };
        if (item.classList.contains('reveal-right')) return { x:  100, y: 18 };
        return { x: 0, y: 76 };
    };

    /* ── Tạo mảng trạng thái cho từng phần tử ──
       Mỗi state lưu:
       - item: tham chiếu đến DOM element
       - currentX/Y/Scale: vị trí/tỉ lệ hiện tại (dùng cho lerp)
       - targetX/Y/Scale: vị trí/tỉ lệ đích cần đến (tính từ scroll) */
    const itemStates = Array.from(revealItems).map((item) => ({
        item,
        currentX:     0,
        currentY:     0,
        currentScale: 1,
        targetX:      0,
        targetY:      0,
        targetScale:  1
    }));

    let ticking = false;     /* Flag ngăn spam requestAnimationFrame khi scroll nhanh */
    let animationFrameId = 0; /* ID frame hiện tại để tránh gọi trùng */

    /* ── updateTargets: tính toán targetX/Y/Scale dựa vào vị trí scroll ──
       Gọi mỗi lần scroll (qua requestAnimationFrame) */
    const updateTargets = () => {
        const viewportHeight = window.innerHeight || 1; /* tránh chia 0 */

        itemStates.forEach((state) => {
            const { item } = state;

            /* getBoundingClientRect: lấy vị trí của phần tử so với viewport
               - rect.top: pixel từ đỉnh viewport đến trên cùng phần tử
               - rect.top âm: phần tử đã cuộn qua viewport rồi */
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.top + rect.height / 2; /* điểm giữa phần tử */

            /* progressRaw:
               - 0.9 viewport → điểm "bắt đầu thấy phần tử đang vào"
               - 0.65 viewport → khoảng dịch chuyển tính tiến độ
               - Khi itemCenter = 90% màn hình → progressRaw = 0 (chưa reveal)
               - Khi itemCenter = 25% màn hình (trong view) → progressRaw = 1 (đã reveal hết) */
            const progressRaw = (viewportHeight * 0.9 - itemCenter) / (viewportHeight * 0.65);

            /* Giới hạn trong [0, 1] → không âm, không > 1 */
            const progress = Math.max(0, Math.min(1, progressRaw));

            /* easing: 1 - (1-p)^2 → ease-out (nhanh đầu, chậm cuối)
               Phần tử vào viewport rất nhanh lúc đầu, gần đến vị trí đúng thì chậm lại */
            const eased = 1 - Math.pow(1 - progress, 2);

            const { x, y } = getOffsetConfig(item);

            /* target = offset * (1 - eased):
               - progress = 0 → target = x, y (lệch hoàn toàn)
               - progress = 1 → target = 0, 0 (về đúng vị trí) */
            state.targetX     = x * (1 - eased);
            state.targetY     = y * (1 - eased);

            /* Scale: bắt đầu từ 0.982 (hơi nhỏ), kết thúc ở 1.0 (kích thước đúng) */
            state.targetScale = 0.982 + eased * 0.018;
        });

        ticking = false; /* Cho phép scroll tiếp theo trigger updateTargets */

        /* Chỉ kích hoạt animateTowardsTargets nếu chưa có frame nào đang chạy */
        if (!animationFrameId) {
            animationFrameId = window.requestAnimationFrame(animateTowardsTargets);
        }
    };

    /* ── lerp: Linear Interpolation — nội suy tuyến tính ──
       lerp(start, end, 0.14) = start + (end - start) * 0.14
       → Mỗi frame, di chuyển 14% khoảng cách còn lại đến đích
       → Tốc độ ban đầu nhanh, chậm dần khi gần đến đích → mượt */
    const lerp = (start, end, factor) => start + (end - start) * factor;

    /* ── animateTowardsTargets: vòng lặp RAF để lerp currentX/Y/Scale ──
       Gọi lại chính nó qua requestAnimationFrame cho đến khi không còn chuyển động */
    const animateTowardsTargets = () => {
        let hasMotion = false; /* kiểm tra có phần tử nào còn cần lerp không */

        itemStates.forEach((state) => {
            /* Lerp mỗi chiều với factor 0.14 (14% mỗi frame, ~60fps) */
            state.currentX     = lerp(state.currentX,     state.targetX,     0.14);
            state.currentY     = lerp(state.currentY,     state.targetY,     0.14);
            state.currentScale = lerp(state.currentScale, state.targetScale, 0.14);

            /* Cập nhật CSS variables → CSS tự áp dụng transform */
            state.item.style.setProperty('--reveal-x',     `${state.currentX.toFixed(2)}px`);
            state.item.style.setProperty('--reveal-y',     `${state.currentY.toFixed(2)}px`);
            state.item.style.setProperty('--reveal-scale', state.currentScale.toFixed(3));

            /* Kiểm tra sai số còn đáng kể không:
               - x/y: còn lệch > 0.12px → vẫn cần lerp tiếp
               - scale: còn lệch > 0.002 → vẫn cần lerp tiếp */
            if (
                Math.abs(state.currentX     - state.targetX)     > 0.12 ||
                Math.abs(state.currentY     - state.targetY)     > 0.12 ||
                Math.abs(state.currentScale - state.targetScale) > 0.002
            ) {
                hasMotion = true;
            }
        });

        if (hasMotion) {
            /* Còn chuyển động → tiếp tục vòng lặp RAF */
            animationFrameId = window.requestAnimationFrame(animateTowardsTargets);
            return;
        }

        /* Không còn chuyển động → dừng vòng lặp, giải phóng tài nguyên */
        animationFrameId = 0;
    };

    /* ── requestUpdate: throttle scroll qua ticking flag ──
       Nếu ticking = true (frame đang đợi chạy) thì bỏ qua scroll event này
       → Tránh xếp hàng hàng trăm requestAnimationFrame khi scroll nhanh */
    const requestUpdate = () => {
        if (ticking) { return; }
        ticking = true;
        window.requestAnimationFrame(updateTargets);
    };

    /* Chạy ngay 1 lần khi trang load để set vị trí đúng cho các phần tử đang trong viewport */
    requestUpdate();

    /* Gắn event scroll: { passive: true } → báo browser rằng handler này
       KHÔNG gọi preventDefault() → browser tối ưu scroll mượt hơn */
    window.addEventListener('scroll', requestUpdate, { passive: true });

    /* Gắn resize để recalculate khi xoay màn hình hoặc thay đổi cửa sổ */
    window.addEventListener('resize', requestUpdate);
}


/* ====================================================================
   HÀM 2: initStoryHeroParallax
   - Khi scroll xuống qua vùng hero:
     + ảnh nền (heroBg) dịch xuống chậm → cảm giác sâu xa
     + khung text (heroContent) dịch xuống nhanh hơn → nổi lên trên
     + heroContent fades dần → biến mất tự nhiên khi cuộn hết hero
   ==================================================================== */
function initStoryHeroParallax() {

    /* Lấy các phần tử cần thiết */
    const hero        = document.getElementById('storyHero');
    const heroBg      = document.getElementById('storyHeroBg');
    const heroContent = document.getElementById('storyHeroContent');

    /* Nếu thiếu bất kỳ phần tử nào → thoát sớm, không lỗi */
    if (!hero || !heroBg || !heroContent) { return; }

    /* Kiểm tra prefers-reduced-motion: tắt parallax cho người dùng nhạy cảm */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) { return; }

    let ticking = false; /* Throttle scroll như hàm 1 */

    /* ── updateParallax: tính và áp dụng transform parallax ── */
    const updateParallax = () => {
        /* getBoundingClientRect của #storyHero để biết vị trí so với viewport */
        const rect       = hero.getBoundingClientRect();
        const heroHeight = rect.height || 1; /* tránh chia 0 nếu height = 0 */

        /* Tối ưu hoá: nếu hero hoàn toàn ngoài viewport thì bỏ qua
           - rect.bottom <= 0: hero đã cuộn qua hoàn toàn → trên viewport
           - rect.top >= window.innerHeight: hero chưa xuất hiện → dưới viewport */
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
            ticking = false;
            return;
        }

        const w = window.innerWidth;

        /* Tắt parallax hoàn toàn trên mobile nhỏ (≤ 600px)
           Lý do: layout mobile đã thu nhỏ, parallax có thể làm ảnh bị lộ viền */
        if (w <= 600) { ticking = false; return; }

        /* scrollProgress: tiến độ scroll qua hero
           - rect.top âm khi ta đã cuộn qua phần đầu hero
           - -rect.top / heroHeight: 0 (chưa scroll) → 1 (cuộn qua hết hero)
           - Math.max/min giới hạn trong [0, 1] */
        const scrollProgress = Math.max(0, Math.min(1, -rect.top / heroHeight));

        /* intensity: giảm 50% cường độ parallax trên tablet (≤ 768px)
           để ảnh không bị lộ quá nhiều khi hero nhỏ hơn */
        const intensity = w <= 768 ? 0.5 : 1;

        /* Tính các giá trị transform:
           - bgOffset: ảnh nền dịch xuống tối đa 18px (chậm → cảm giác xa)
           - contentOffset: text dịch xuống tối đa 26px (nhanh hơn → cảm giác gần)
           - contentOpacity: giảm từ 1 xuống ~0.7 khi scroll qua hết hero */
        const bgOffset      = scrollProgress * 18 * intensity;
        const contentOffset = scrollProgress * 26 * intensity;
        const contentOpacity = Math.max(0.7, 1 - scrollProgress * 0.26 * intensity);

        /* Áp dụng transform trực tiếp — không dùng lerp vì hero parallax
           chỉ cần theo sát scroll, không cần "đuổi theo" như reveal */
        heroBg.style.transform      = `translateY(${bgOffset}px)`;
        heroContent.style.transform = `translateY(${contentOffset}px)`;
        heroContent.style.opacity   = String(contentOpacity);

        ticking = false;
    };

    /* ── onScroll: throttle qua ticking + requestAnimationFrame ── */
    const onScroll = () => {
        if (ticking) { return; }
        ticking = true;
        window.requestAnimationFrame(updateParallax);
    };

    /* Chạy ngay 1 lần khi trang mở (trong trường hợp trang đã scroll đến vị trí nào đó) */
    onScroll();

    /* { passive: true } → scroll không bị block bởi handler này */
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
}
