document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            if (navLinks.style.display === 'flex') {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.right = '0';
                navLinks.style.background = 'white';
                navLinks.style.padding = '1rem';
                navLinks.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                navLinks.style.zIndex = '1000';
            }
        });
    }

    // Quiz Logic
    const quizOptions = document.querySelectorAll('.quiz-option');
    quizOptions.forEach(option => {
        option.addEventListener('click', function () {
            // Reset siblings
            const parent = this.closest('.quiz-options');
            parent.querySelectorAll('.quiz-option').forEach(opt => {
                opt.classList.remove('correct', 'incorrect');
                opt.style.pointerEvents = 'none'; // Disable further clicks
            });

            // Check answer
            if (this.dataset.correct === 'true') {
                this.classList.add('correct');
            } else {
                this.classList.add('incorrect');
                // Highlight correct answer
                parent.querySelector('[data-correct="true"]').classList.add('correct');
            }
        });
    });

    // Dynamic Copyright Year
    const yearSpan = document.querySelector('#year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

// MathJax Configuration
window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true
    },
    svg: {
        fontCache: 'global'
    }
};
