### Basic Usage ###

Place this code somewhere in the `<head></head>` section.

```html
<script type="text/javascript" src="//googledrive.com/host/0B-ME4OmVndQzMFNaMWpqVzVYUFE/1.1.0/blogtoc.min.js"></script>
```

Then add these codes below in your blog page or post

```html
<div id="YOUR_ID"></div>
 
<script type="text/javascript">
var myDiv = document.getElementById('YOUR_ID');
 
BlogToc( myDiv ).build({
  url: "YOUR_BLOGSPOT_URL.blogspot.com"
});
</script>
```

### Compatibility ###
The Javascript Files are being tested in the latest versions of Chrome, Firefox, and IE6+

### License ###
http://www.apache.org/licenses/LICENSE-2.0

### External Resources ###
BlogToc using some external service to generate image on the fly

* [boxresizer](http://boxresizer.com/)
* [sencha](http://www.sencha.com/learn/how-to-use-src-sencha-io/)
* [using google image resizer trick](http://carlo.zottmann.org/2013/04/14/google-image-resizer/)

Some awesome projects for theming purpose

* [Twitter Bootstrap](http://getbootstrap.com/)
* [TODC Bootstrap](http://todc.github.io/todc-bootstrap/index.html)

And iconic font from [Bootmetro](http://aozora.github.io/bootmetro)