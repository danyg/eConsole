[eConsole Web](http://danyg.github.com/eConsole/ "eConsole Web")

eConsole
========

[eConsole](http://danyg.github.com/eConsole/ "eConsole Web") se encuentra en estado ALPHA y por el momento es una demo tecnica funcional.

[eConsole](http://danyg.github.com/eConsole/ "eConsole Web") es una consola javascript externa, como puede ser la consola javascript de firebug o 
las webkit tools, la diferencia es que se ejecuta externamente al navegador, permitiendo al 
desarrollador depurar sitios web que corran en dispositivos o navegadores que no dispongan de 
tales caracteristicas, como ser un iPad o un android.

[eConsole](http://danyg.github.com/eConsole/ "eConsole Web") carga un servidor socket.io en el puerto 4040, por lo que eConsole debe ejecutarse en 
el mismo pc que alberga el servidor web (si no tendremos problemas de crossdomain).

Pasos para su uso
-----------------

- Copiar los ficheros:
  - /data/node_modules/test_server/test_server/js/lib/socket.io.min.js
  - /data/node_modules/test_server/test_server/js/eConsole.js  
- Cargarlos en nuestra pagina web
  - < script src="js/eConsole/socket.io.min.js" type="text/javascript"></script>
  - < script src="js/eConsole/eConsole.js" type="text/javascript"></script>
  - Deben ser los 2 primeros scripts a cargar.
- Ejecutar [eConsole](http://danyg.github.com/eConsole/ "eConsole Web") bien desde app.exe en windows o ejecutando lo siguiente en un terminal (Linux con X / Mac OS X)
  - cd data
  - node --harmony app

Caracteristicas
---------------

- econsole.log
  - Acepta todo tipo de variables, y recursos estaticos, los objetos pueden ser inspeccionados desde la consola remota.

[M&aacute;s Informaci&oacute;n](http://danyg.github.com/eConsole/ "eConsole Web")
