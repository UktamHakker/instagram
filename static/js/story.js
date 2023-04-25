const container = document.querySelector(".daily-stories__outer");
const imgs_wrapper = document.querySelector(".daily-stories__container");
const imgs = document.querySelectorAll(".daily-stories .slide");
const bars = document.querySelectorAll(".progress-bars .bar");
const prevBtn = document.querySelector("#prev-slide");
const nextBtn = document.querySelector("#next-slide");
const centralArea = document.querySelector(".central-area");
const total_imgs = imgs.length;
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const CM_container = document.querySelector(".context-menu-container");
const CM_button = CM_container.querySelector("a.button");
const cm_link_save = document.querySelector("#c-menu_save");
const cm_link_share = document.querySelector("#c-menu_share");
const cm_link_copy = document.querySelector("#c-menu_copy");
const cm_link_cancel = document.querySelector("#c-menu_cancel");

let entryURL;

let container_width = container.clientWidth;
let current_index = 0;
let pointer_is_down = false;
let [start_x, end_x] = [0, 0];
let move_distance = 0;
let timersSet = [];
let dataSet = [];
let timer;

function reload() {
    window.location.reload(false);
}

function init() {
    container_width = container.clientWidth;
    CM_container.style.width = `${container_width - 30}px`;
    imgs_wrapper.style.width = `${container_width * total_imgs}px`;
}

function collections() {
    for (var i = 0; i < total_imgs; ++i) {
        timersSet.push(imgs[i].getAttribute("data-timeout"));

        if (imgs[i].classList.contains("video")) {
            dataSet.push(imgs[i].querySelector("video").getAttribute("src"));
        } else {
            dataSet.push(imgs[i].querySelector("img").getAttribute("src"));
        }
    }
}

function redirect(url) {
    if (url !== null) {
        window.location = "https://f5.local/" + url; // Redirect to "entry" URL
    } else {
        window.location = "https://f5.local/"; // Redirect to homepage
    }
}

function slidesAutoPlay() {
    clearTimeout(timer);

    timer = setTimeout(() => {
        if (current_index < total_imgs - 1) {
            nextSlide();
        } else {
            console.log("End of Story");

            toaster("End of Story for Today! &#128526;", "info");

            // setCookie('F5_Daily', true);  // Set cookies - daily seen
            // deleteCookie('EntryPageID'); // Remove temp "entry" URL cookie
            // setTimeout( redirect(entryURL), 50); // Redirect to corresponding page
        }
    }, timersSet[current_index]);
}

// Mousemove and Touchmove Event
function createDraggingEffects() {
    if (document.body.classList.contains("menu-open")) return; // Disallow slides dragging if context menu is open

    const max_distance = 2;
    const scrolled_distance =
        current_index * container_width + (start_x - end_x) / max_distance;

    switchImages(-scrolled_distance);
}

// Set slide "active"
function setSlideActive(i) {
    const currentSlide = imgs[i];

    imgs.forEach((el) => el.classList.remove("active"));
    currentSlide.classList.add("active");

    playVideo();
}

// Set bar "active / animate"
function setBarActive(i) {
    bars.forEach((el, index) => {
        if (index >= i) {
            el.classList.remove("animate");
        }
        if (index < i) {
            el.classList.add("seen");
            el.classList.remove("animate");
        } else {
            el.classList.remove("seen");
        }
    });

    bars[i].classList.add("animate");
}

// Set current slide active
function setActive() {
    if (current_index < total_imgs - 1) {
        // if ain't LAST
        setBarActive(parseInt(current_index, 10) + 1);
    } else {
        setBarActive(0);
    }

    setTimeout(() => {
        setBarActive(current_index);
        setSlideActive(current_index);
    }, 1);
}

// Mouseup and Touchend Event
function calculateFinalMoveDistance() {
    const scrolled_distance = Math.abs(start_x - end_x);
    const minimum_distance = 50;

    if (document.body.classList.contains("menu-open")) return; // Disallow slides switching if context menu is open

    if (scrolled_distance < minimum_distance && current_index !== 0) {
        move_distance = -(current_index * container_width);
        switchImages();
        return false;
    }

    stopVideo(); // Stop video on current slide if any were playing

    if ((start_x > end_x) & (current_index < total_imgs - 1)) {
        // scroll next
        current_index++;
    } else if (start_x < end_x && current_index > 0) {
        // scroll prev
        current_index--;
    } else if (current_index === 0) {
        setBarActive(1); // hack to reset animation's play state of first slide
    }

    move_distance = -(current_index * container_width);
    switchImages(move_distance);

    updateSaveImgSrc();

    setActive();

    slidesAutoPlay();
}

// Switch to Next Slide
function nextSlide() {
    if (current_index < total_imgs - 1) {
        // check if it isn't LAST slide

        if (document.body.classList.contains("menu-open")) return; // Disallow slides switching if context menu is open

        document.body.classList.remove("paused"); // Un-Pause slider

        stopVideo(); // Stop video on current slide if any were playing

        current_index++;

        move_distance = -(current_index * container_width);
        switchImages(move_distance);
        updateSaveImgSrc();

        setActive();

        slidesAutoPlay();
    }
}

// Switch to Prev Slide
function prevSlide() {
    if (current_index >= 0) {
        // check if it isn't FIRST slide

        if (document.body.classList.contains("menu-open")) return; // Disallow slides switching if context menu is open

        document.body.classList.remove("paused"); // Un-Pause slider

        stopVideo(); // Stop video on current slide if any were playing

        if (current_index > 0) {
            // decrease index only if larger than 0
            current_index--;
        }

        move_distance = -(current_index * container_width);
        switchImages(move_distance);
        updateSaveImgSrc();

        setActive();

        slidesAutoPlay();
    }
}

// Switch to specific Slide
function slideTo(i) {
    if (document.body.classList.contains("menu-open")) return; // Disallow slides switching if context menu is open

    document.body.classList.remove("paused"); // Un-Pause slider
    stopVideo(); // Stop video on current slide if any were playing

    current_index = i;

    move_distance = -(current_index * container_width);
    switchImages(move_distance);
    updateSaveImgSrc();

    setActive();

    slidesAutoPlay();
}

function pauseVideo() {
    if (isVideo()) {
        const v = imgs[current_index].querySelector("video");
        v.muted = true;
        v.pause();
    }
}

function playVideo() {
    if (isVideo()) {
        const v = imgs[current_index].querySelector("video");
        v.muted = true;
        v.play();
    }
}

function stopVideo() {
    if (isVideo()) {
        const v = imgs[current_index].querySelector("video");
        v.pause();
        v.currentTime = 0;
    }
}

function toggleMute() {
    if (isVideo()) {
        const v = imgs[current_index].querySelector("video");
        v.muted = !v.muted;
    }
}

function cancelAnimation() {
    clearTimeout(timer);
}

// Switch Images
function switchImages(scrolled_number) {
    const distance = scrolled_number || move_distance;
    imgs_wrapper.style.transform = `translate3d(${distance}px, 0px, 0px)`;
}

// Mouseleave event
function handleMouseLeave(e) {
    if (!pointer_is_down) return false;

    pointer_is_down = false;
    [start_x, end_x] = [0, 0];
    switchImages();
}

// Update SRC of "Save Image" button on context menu
function updateSaveImgSrc() {
    cm_link_save.href = dataSet[current_index];
}

// Toggle Play/Pause of Carousel
function toggleSliderAutoplay(e) {
    const state = e.target.getAttribute("data-state");

    // Return if Context Menu is active
    if (CM_container.classList.contains("active")) {
        return;
    }

    if (state === "paused") {
        centralArea.setAttribute("data-state", "playing");
        document.body.classList.remove("paused");

        setActive();

        slidesAutoPlay();

        stopVideo();
        playVideo();
    } else {
        centralArea.setAttribute("data-state", "paused");
        document.body.classList.add("paused");
        cancelAnimation();
        pauseVideo();
    }
}

// Check if Slide contains video
function isVideo() {
    return imgs[current_index].classList.contains("video");
}

// Handle Context-Menu
function CM_Handle(e) {
    e.preventDefault();

    CM_container.classList.toggle("active");

    if (CM_container.classList.contains("active")) {
        document.body.classList.add("menu-open");
        cancelAnimation();
        pauseVideo();
        updateSaveImgSrc();
    } else {
        document.body.classList.remove("menu-open");

        setActive();

        slidesAutoPlay();

        stopVideo();
        playVideo();
    }
}

function copyText(element) {
    const textToCopy = element.href;
    const tempInput = document.createElement("input");

    tempInput.type = "text";
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("Copy");
    document.body.removeChild(tempInput);

    toaster("Link copied to clipboard", "success");
}

function toaster(message, type, timeout = 5000) {
    const body = document.body;

    if (typeof type === "undefined") {
        return;
    }

    const toast = document.createElement("div");

    toast.classList.add("toast-notification", type);
    toast.innerHTML = message;
    body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("active");
    }, 100);
    setTimeout(() => {
        toast.classList.remove("active");
    }, timeout - 500);
    setTimeout(() => {
        toast.parentNode.removeChild(toast);
    }, timeout);
}

// Bind Events on document ready
document.addEventListener("DOMContentLoaded", () => {
    init();
    collections();

    setSlideActive(0);
    setBarActive(0);

    slidesAutoPlay();

    if (isMobile) {
        document.body.classList.add("mobile");
    }
});

// Handle PREV Slide btn
prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    prevSlide();
});

// Handle NEXT Slide btn
nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    nextSlide();
});

// Handle click on Central Area - Play/Pause animation
centralArea.addEventListener("click", (e) => {
    e.preventDefault();
    toggleSliderAutoplay(e);
});

// Handle Mouse events
// container.addEventListener("mousedown", (e) => {
//     e.preventDefault();

//     pointer_is_down = true;
//     start_x = e.pageX;
// });

// container.addEventListener("mousemove", (e) => {
//     e.preventDefault();

//     if (!pointer_is_down) return false;
//     end_x = e.pageX;
//     createDraggingEffects();
// });

// container.addEventListener("mouseup", (e) => {
//     e.preventDefault();

//     pointer_is_down = false;
//     calculateFinalMoveDistance();
// });

// container.addEventListener("mouseleave", handleMouseLeave);

// // Handle Touch events
// container.addEventListener("touchstart", (e) => {
//     pointer_is_down = true;
//     start_x = e.touches[0].pageX;
// });

// container.addEventListener("touchmove", (e) => {
//     if (!pointer_is_down) return false;
//     end_x = e.touches[0].pageX;
//     createDraggingEffects();
// });

// container.addEventListener("touchend", (e) => {
//     pointer_is_down = false;
//     calculateFinalMoveDistance();
// });

// Handle Window resize
window.addEventListener("resize", reload);

// Trigger Context Menu
CM_button.addEventListener("click", CM_Handle);

// Dismiss Context Menu
cm_link_cancel.addEventListener("click", CM_Handle);

// Copy STORIES Link from Context Menu
cm_link_copy.addEventListener("click", (e) => {
    e.preventDefault();
    copyText(e.target);
});

// Handle Progress Bar Click
bars.forEach((bar) => {
    bar.addEventListener("click", () => {
        slideTo(bar.getAttribute("data-index"));
    });
});
