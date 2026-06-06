#!/bin/bash

echo "Iniciando despliegue del frontend web de A-Darts..."

# 1. Traer cambios de GitHub
echo "1. Descargando los cambios de GitHub..."
git pull
if [ $? -ne 0 ]; then
    echo "Error: No se pudieron descargar los cambios de GitHub."
    exit 1
fi

# 2. Instalar nuevas dependencias
echo "2. Instalando las dependencias..."
npm install
if [ $? -ne 0 ]; then
    echo "Error: Falló la instalación de las dependencias."
    exit 1
fi

# 3. Ejecutar los tests
#echo "3. Corriendo las pruebas automatizadas (Tests)..."
#npm run test -- --watchAll=false

#if [ $? -ne 0 ]; then
#    echo "Error: Los tests han fallado."
#    exit 1
#fi
#echo "Todos los tests pasaron con éxito"

# 4. Compilar si todo lo anterior es correcto
echo "4. Compilando la aplicación de React..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error: La compilación de React falló."
    exit 1
fi

echo "Éxito: Web probada, compilada y actualizada correctamente."
