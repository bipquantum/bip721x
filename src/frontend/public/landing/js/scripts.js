(function($){
	jQuery(document).ready(function() {	

		// Scroll to Top
		jQuery('.scrolltotop').click(function(){
			jQuery('html').animate({'scrollTop' : '0px'}, 400);
			return false;
		});
		
		jQuery(window).scroll(function(){
			var upto = jQuery(window).scrollTop();
			if(upto > 500) {
				jQuery('.scrolltotop').fadeIn();
			} else {
				jQuery('.scrolltotop').fadeOut();
			}
		});

		const carousel3Dswiper = new Swiper(".carousel-3D-swiper", {
		    loop: true,
		    effect: "coverflow",
		    grabCursor: true,
		    centeredSlides: true,
		    slidesPerView: 2,
		    coverflowEffect: {
		      rotate: 0,
		      stretch: 0,
		      depth: 300,
		      modifier: 2,
		      slideShadows: true
		    },
		    navigation: {
		      	nextEl: ".swiper-button-next",
		      	prevEl: ".swiper-button-prev",
		    },
		    pagination: {
		      	el: ".swiper-pagination"
		    }
	  	});

		

		


		

				
		
		
		
		
		
		
		
		
	});
})(jQuery);