const setupAccordion = () => {
    const accordions = document.querySelectorAll('.accordion .item');
    if(!accordions.length) return;
    accordions.forEach((el) => {
        el.querySelector('.title').addEventListener('click', () => {
            const activeEl = document.querySelector('.accordion .item.active');
            el.classList.toggle('active');
            if(activeEl === el) return;
            activeEl.classList.remove('active');
        })
    })
}

const setupAnimations = () => {
    const slideDown = document.querySelectorAll('.slideDown, .slideUp');

    const handleIntersection = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = entry.target.dataset.delay ?? 0;
                entry.target.style.visibility = 'visible';
                entry.target.style.opacity = 0;

                if(entry.target.classList.contains('slideDown')) {
                    entry.target.style.animationName = "slideDown";
                } else if(entry.target.classList.contains('slideUp')) {
                    entry.target.style.animationName = "slideUp";
                }

                observer.unobserve(entry.target);
            }
        });
    }

    const observer = new IntersectionObserver(handleIntersection, { threshold: 0.5 });

    slideDown.forEach((el) => {
        observer.observe(el);
    });
}

const setupForm = () => {
    const form = document.getElementById('agendar-consulta');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        let serializedForm = {};
        formData.forEach((valor, chave) => {
            serializedForm = {
                ...serializedForm,
                [chave]: valor
            }
        });
        dataLayer.push({'event': 'contact-form-send', 'data': JSON.stringify(serializedForm)});
        const successMessage = document.getElementById('success');
        const mailSuccess = document.getElementById('email-sender');
        e.target.style.display = 'none';
        mailSuccess.innerHTML = serializedForm.email;
        successMessage.style.display = 'block';
    })
}

const setupScrollTo = () => {
    const elTargets = document.querySelectorAll('[data-scrollTo]');

    elTargets.forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const target = el.dataset.scrollto;
            const targetElement = document.querySelector(target);
            targetElement.scrollIntoView();
            if(targetElement.querySelector('input')) {
                targetElement.querySelector('input').focus();
            }
        });
    });
}

setupAccordion();
setupAnimations();
setupForm();
setupScrollTo();