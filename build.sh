#!/bin/bash

DIRECTORY=temp
TARGET=build

rm -fr $DIRECTORY
rm -fr $TARGET

mkdir $DIRECTORY
mkdir $TARGET

cp -r better-history/* $DIRECTORY
cp scripts/config.js $DIRECTORY/scripts
cp -r $DIRECTORY/images $TARGET/
cp -r $DIRECTORY/_locales $TARGET/

# Chrome Historian uses WebWorkers that cannot be concated
mkdir $TARGET/bower_components
cp -r $DIRECTORY/bower_components/chrome-historian $TARGET/bower_components/

gulp --directory $DIRECTORY --target $TARGET

zip -r extension.zip $TARGET

rm -fr $DIRECTORY
