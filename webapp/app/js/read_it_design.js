/**
 * Created by Gabi on 16/06/2015.
 * require jQuery
 */

$(document).ready(function(){
    $("#content").css( 'marginTop', $("#menu").css("height") );

    $('#navbar').on('click', 'li', function(){
        if($(this).attr('ui-sref')){
            $('#navbar').toggleClass('in');
            $('main').scrollTop();
        }
    })
});