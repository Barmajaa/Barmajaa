const Container_AboutUs = document.querySelector(".Container_AboutUs");
const AboutUs_nav = document.querySelector(".AboutUs_nav");
const Exit_Prof = document.querySelector(".Exit_Prof");

AboutUs_nav.addEventListener("click", () => {
    Container_AboutUs.showModal();

    Exit_Prof.classList.add(".show_anything");

    Exit_Prof.addEventListener("click", () => {
        Container_AboutUs.close();
    })
})