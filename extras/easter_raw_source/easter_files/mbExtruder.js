/*******************************************************************************
 jquery.mb.components
 Copyright (c) 2001-2010. Matteo Bicocchi (Pupunzi); Open lab srl, Firenze - Italy
 email: mbicocchi@open-lab.com
 site: http://pupunzi.com

 Licences: MIT, GPL
 http://www.opensource.org/licenses/mit-license.php
 http://www.gnu.org/licenses/gpl.html
 ******************************************************************************/

/*
 * Name:jquery.mb.extruder
 * Version: 2.1
 * dependencies: jquery.metadata.js, jquery.mb.flipText.js, jquery.hoverintent.js
 */


(function(jQuery) {
  document.extruder=new Object();
  document.extruder.left = 0;
  document.extruder.top = 0;
  document.extruder.bottom = 0;
  document.extruder.right = 0;
  document.extruder.idx=0;
  var isIE=jQuery.browser.msie;

  jQuery.mbExtruder= {
    author:"Matteo Bicocchi",
    version:"2.1",
    defaults:{
      width:350,
      positionFixed:true,
      sensibility:800,
      position:"top",
      accordionPanels:true,
      top:"auto",
      extruderOpacity:1,
      flapMargin:35,
      textOrientation:"bt", // or "tb" (top-bottom or bottom-top)
      onExtOpen:function(){},
      onExtContentLoad:function(){},
      onExtClose:function(){},
      hidePanelsOnClose:true,
      autoCloseTime:0,
      slideTimer:300
    },

    buildMbExtruder: function(options){
      return this.each (function (){
        this.options = {};
        jQuery.extend (this.options, jQuery.mbExtruder.defaults);
        jQuery.extend (this.options, options);
        this.idx=document.extruder.idx;
        document.extruder.idx++;
        var extruder,extruderContent,wrapper,extruderStyle,wrapperStyle,txt,timer;
        extruder= jQuery(this);
        extruderContent=extruder.html();

        extruder.css("zIndex",100);

        var isVertical = this.options.position=="left" || this.options.position=="right";

        var extW= isVertical?1: this.options.width;

        var c= jQuery("<div/>").addClass("content").css({overflow:"hidden", width:extW});
        c.append(extruderContent);
        extruder.html(c);

        var position=this.options.positionFixed?"fixed":"absolute";
        extruder.addClass("extruder");
        extruder.addClass(this.options.position);
        var isHorizontal = this.options.position=="top" || this.options.position=="bottom";
        extruderStyle=
                this.options.position=="top"?
                {position:position,top:0,right:5,width:this.options.width}:
                        this.options.position=="bottom"?
                        {position:position,bottom:0,left:"50%",marginLeft:-this.options.width/2,width:this.options.width}:
                                this.options.position=="left"?
                                {position:position,top:0,left:0,width:1}:
                                {position:position,top:0,right:0,width:1};
        extruder.css(extruderStyle);
        if(!isIE) extruder.css({opacity:this.options.extruderOpacity});
        extruder.wrapInner("<div class='ext_wrapper'></div>");
        wrapper= extruder.find(".ext_wrapper");

        wrapperStyle={position:"absolute", width:isVertical?1:this.options.width};
        wrapper.css(wrapperStyle);


        if (isHorizontal){
          this.options.position=="top"?document.extruder.top++:document.extruder.bottom++;
          if (document.extruder.top>1 || document.extruder.bottom>1){
            alert("more than 1 mb.extruder on top or bottom is not supported jet... hope soon!");
            return;
          }
        }

        if (jQuery.metadata){
          jQuery.metadata.setType("class");
          if (extruder.metadata().title) extruder.attr("extTitle",extruder.metadata().title);
          if (extruder.metadata().url) extruder.attr("extUrl",extruder.metadata().url);
          if (extruder.metadata().data) extruder.attr("extData",extruder.metadata().data);
        }
        var flapFooter=jQuery("<div class='footer'/>");
        var flap=jQuery("<div class='flap'><span class='flapLabel'/></div>");
        if (document.extruder.bottom){
          wrapper.prepend(flapFooter);
          wrapper.prepend(flap);
        }else{
          wrapper.append(flapFooter);
          wrapper.append(flap);
        }

        txt=extruder.attr("extTitle")?extruder.attr("extTitle"): "";
        var flapLabel = extruder.find(".flapLabel");
        flapLabel.text(txt);
        if(isVertical){
          flapLabel.html(txt).css({whiteSpace:"noWrap"});//,height:this.options.flapDim
          var orientation= this.options.textOrientation == "tb";
          var labelH=extruder.find('.flapLabel').getFlipTextDim()[1];
          extruder.find('.flapLabel').mbFlipText(orientation);
        }else{
          flapLabel.html(txt).css({whiteSpace:"noWrap"});
        }

        if (extruder.attr("extUrl")){
            extruder.setMbExtruderContent({
              url:extruder.attr("extUrl"),
              data:extruder.attr("extData"),
              callback: function(){
                if (extruder.get(0).options.onExtContentLoad) extruder.get(0).options.onExtContentLoad();
              }
          })
        }else{
          var container=jQuery("<div>").addClass("text").css({width:extruder.get(0).options.width-20, height:extruder.height()-20, overflowY:"auto"});
          c.wrapInner(container);
          extruder.setExtruderVoicesAction();
        }

        flap.bind("click",function(){
          if (!extruder.attr("open")){
            extruder.openMbExtruder();
          }else{
            extruder.closeMbExtruder();
          }
        });

        c.bind("mouseleave", function(){
          jQuery(document).one("click.extruder"+extruder.get(0).idx,function(){extruder.closeMbExtruder();});
          timer=setTimeout(function(){

            if(extruder.get(0).options.autoCloseTime > 0){
              extruder.closeMbExtruder();
            }
          },extruder.get(0).options.autoCloseTime);
        }).bind("mouseenter", function(){clearTimeout(timer); jQuery(document).unbind("click.extruder"+extruder.get(0).idx);});

        if (isVertical){
          c.css({ height:"100%"});
          if(this.options.top=="auto") {
            flap.css({top:100+(this.options.position=="left"?document.extruder.left:document.extruder.right)});
            this.options.position=="left"?document.extruder.left+=labelH+this.options.flapMargin:document.extruder.right+= labelH+this.options.flapMargin;
          }else{
            flap.css({top:this.options.top});
          }
          var clicDiv=jQuery("<div/>").css({position:"absolute",top:0,left:0,width:"100%",height:"100%",background:"transparent"});
          flap.append(clicDiv);
        }
      });
    },

    setMbExtruderContent: function(options){
      this.options = {
        url:false,
        data:"",
        callback:function(){}
      };
      jQuery.extend (this.options, options);
      if (!this.options.url || this.options.url.length==0){
        alert("internal error: no URL to call");
        return;
      }
      var url=this.options.url;
      var data=this.options.data;
      var where=jQuery(this), voice;
      var cb= this.options.callback;
      var container=jQuery("<div>").addClass("container");
      if (!(jQuery.browser.msie && jQuery.browser.version<=7))
        container.css({width:jQuery(this).get(0).options.width});
      where.find(".content").wrapInner(container);
      jQuery.ajax({
        type: "GET",
        url: url,
        data: data,
        success: function(html){
          where.find(".container").append(html);
          voice=where.find(".voice");
          voice.hover(function(){jQuery(this).addClass("hover");},function(){jQuery(this).removeClass("hover");});
          where.setExtruderVoicesAction();
          if (cb) {
            setTimeout(function(){cb();},100);
          }
        }
      });
    },

    openMbExtruder:function(c){
      var extruder= jQuery(this);
      extruder.attr("open",true);
      jQuery(document).unbind("click.extruder"+extruder.get(0).idx);
      var opt= extruder.get(0).options;
      extruder.addClass("open");
      if(!isIE) extruder.css("opacity",1);
      var position= opt.position;
      extruder.mb_bringToFront();
      if (position=="top" || position=="bottom"){
        extruder.find('.content').slideDown( opt.slideTimer);
        if(opt.onExtOpen) opt.onExtOpen();
      }else{

        if(!isIE) jQuery(this).css("opacity",1);
        extruder.find('.ext_wrapper').css({width:""});
        extruder.find('.content').css({overflowX:"hidden", display:"block"});
        extruder.find('.content').animate({ width: opt.width}, opt.slideTimer);
        if(opt.onExtOpen) opt.onExtOpen();
      }
      if (c) {
        setTimeout(function(){
          jQuery(document).one("click.extruder"+extruder.get(0).idx,function(){extruder.closeMbExtruder();});
        },100);
      }
    },

    closeMbExtruder:function(){
      var extruder= jQuery(this);
      extruder.removeAttr("open");
      var opt= extruder.get(0).options;
      extruder.removeClass("open");
      jQuery(document).unbind("click.extruder"+extruder.get(0).idx);
      if(!isIE) extruder.css("opacity",opt.extruderOpacity);
      if(opt.hidePanelsOnClose) extruder.hidePanelsOnClose();
      if (opt.position=="top" || opt.position=="bottom"){
        extruder.find('.content').slideUp(opt.slideTimer);
        if(opt.onExtClose) opt.onExtClose();
      }else if (opt.position=="left" || opt.position=="right"){
        extruder.find('.content').css({overflow:"hidden"});
        extruder.find('.content').animate({ width: 1 }, opt.slideTimer,function(){
          extruder.find('.ext_wrapper').css({width:1});
          extruder.find('.content').css({overflow:"hidden",display:"none"});
          if(opt.onExtClose) opt.onExtClose();
        });
      }
    }
  };

  jQuery.fn.mb_bringToFront= function(){
    var zi=10;
    jQuery('*').each(function() {
      if(jQuery(this).css("position")=="absolute" ||jQuery(this).css("position")=="fixed"){
        var cur = parseInt(jQuery(this).css('zIndex'));
        zi = cur > zi ? parseInt(jQuery(this).css('zIndex')) : zi;
      }
    });
    jQuery(this).css('zIndex',zi+=1);
    return zi;
  };

  /*
   * EXTRUDER CONTENT
   */

  jQuery.fn.setExtruderVoicesAction=function(){
    var extruder=jQuery(this);
    var opt=extruder.get(0).options;
    var voices= jQuery(this).find(".voice");
    voices.each(function(){
      var voice=jQuery(this);
      if (jQuery.metadata){
        jQuery.metadata.setType("class");
        if (voice.metadata().panel) voice.attr("panel",voice.metadata().panel);
        if (voice.metadata().data) voice.attr("data",voice.metadata().data);
        if (voice.metadata().disabled) voice.attr("setDisabled", voice.metadata().disabled);
      }

      if (voice.attr("setDisabled"))
        voice.disableExtruderVoice();

      if (voice.attr("panel") && voice.attr("panel")!="false"){
        voice.append("<span class='settingsBtn'/>");
        voice.find(".settingsBtn").css({opacity:.5});
        voice.find(".settingsBtn").hover(
                function(){
                  jQuery(this).css({opacity:1});
                },
                function(){
                  jQuery(this).not(".sel").css({opacity:.5});
                }).click(function(){
          if (jQuery(this).parents().hasClass("sel")){
            if(opt.accordionPanels)
              extruder.hidePanelsOnClose();
            else
              jQuery(this).closePanel();
            return;
          }

          if(opt.accordionPanels){
            extruder.find(".optionsPanel").slideUp(400,function(){jQuery(this).remove();});
            voices.removeClass("sel");
            voices.find(".settingsBtn").removeClass("sel").css({opacity:.5});
          }
          var content=jQuery("<div class='optionsPanel'></div>");
          voice.after(content);
          jQuery.ajax({
            type: "GET",
            url: voice.attr("panel"),
            data: voice.attr("data"),
            success: function(html){
              var c= jQuery(html);
              content.html(c);
              content.children().not(".text")
                      .addClass("panelVoice")
                      .click(function(){
                extruder.closeMbExtruder();
              });
              content.slideDown(400);
            }
          });
          voice.addClass("sel");
          voice.find(".settingsBtn").addClass("sel").css({opacity:1});
        });
      }

      if (voice.find("a").length==0 && voice.attr("panel")){
        voice.find(".label").not(".disabled").css("cursor","pointer").click(function(){
          voice.find(".settingsBtn").click();
        });
      }

      if ((!voice.attr("panel") ||voice.attr("panel")=="false" ) && (!voice.attr("setDisabled") || voice.attr("setDisabled")!="true")){
        voice.find(".label").click(function(){
          extruder.hidePanelsOnClose();
          extruder.closeMbExtruder();
        });
      }
    });
  };

  jQuery.fn.disableExtruderVoice=function(){
    var voice=jQuery(this);
    var label = voice.find(".label");
    voice.removeClass("sel");
    voice.next(".optionsPanel").slideUp(400,function(){jQuery(this).remove();});
    voice.attr("setDisabled",true);
    label.css("opacity",.4);
    voice.hover(function(){jQuery(this).removeClass("hover");},function(){jQuery(this).removeClass("hover");});
    label.addClass("disabled").css("cursor","default");
    voice.find(".settingsBtn").hide();
    voice.bind("click",function(event){
      event.stopPropagation();
      return false;
    });
  };

  jQuery.fn.enableExtruderVoice=function(){
    var voice=jQuery(this);
    voice.attr("setDisabled",false);
    voice.find(".label").css("opacity",1);
    voice.find(".label").removeClass("disabled").css("cursor","pointer");
    voice.unbind("click");
    voice.find(".settingsBtn").show();
  };

  jQuery.fn.hidePanelsOnClose=function(){
    var voices= jQuery(this).find(".voice");
    jQuery(this).find(".optionsPanel").slideUp(400,function(){jQuery(this).remove();});
    voices.removeClass("sel");
    voices.find(".settingsBtn").removeClass("sel").css("opacity",.5);
  };

  jQuery.fn.openPanel=function(){
    var voice=jQuery(this).hasClass("voice") ? jQuery(this) : jQuery(this).find(".voice");
    voice.each(function(){
      if(jQuery(this).hasClass("sel")) return;
      jQuery(this).find(".settingsBtn").click();
    })
  };

  jQuery.fn.closePanel=function(){
    var voice=jQuery(this).hasClass("voice") ? jQuery(this) : jQuery(this).parent(".voice");
    voice.next(".optionsPanel").slideUp(400,function(){jQuery(this).remove();});
    voice.removeClass("sel");
    jQuery(this).removeClass("sel").css("opacity",.5);
  };

  jQuery.fn.buildMbExtruder=jQuery.mbExtruder.buildMbExtruder;
  jQuery.fn.setMbExtruderContent=jQuery.mbExtruder.setMbExtruderContent;
  jQuery.fn.closeMbExtruder=jQuery.mbExtruder.closeMbExtruder;
  jQuery.fn.openMbExtruder=jQuery.mbExtruder.openMbExtruder;

})(jQuery);