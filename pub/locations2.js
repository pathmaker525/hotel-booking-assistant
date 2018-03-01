$(function(){
  $('.elemPlace').on('click',function(e){
    
    //3---> food
    if($(this).attr('data-category') === '3'){
      $('.iconFood').removeClass('hide');
      $('.iconPlace').addClass('hide');
    }else{     
       //2---> place
      $('.iconFood').addClass('hide');
      $('.iconPlace').removeClass('hide');
    }

    $('#lightbox').css('visibility','visible');
    $('#context').html($(this).attr('data-context'));
    $('#extra').html($(this).find('.extra').html());
    var imgsrc = $(this).find('img').attr('src');
    $('#lightboxImg').css('background-image','url("' + imgsrc + '")');
    $('#title').html($(this).find('h4').html());
    
    $('#maplink').attr('href',$(this).attr('data-maplink'));
    $('#weblink').attr('href',$(this).attr('data-weblink'));
  })
});

function closeLightbox(){
  $('#lightbox').css('visibility','hidden');
}