#!/bin/sh
techdocs-cli build --no-docker --source-dir=$INPUT_SOURCE --output-dir=$INPUT_OUTPUT
techdocs-cli publish --publisher-type awsS3 --storage-name=$INPUT_BUCKET --entity=$INPUT_REFERENCE --directory=$INPUT_OUTPUT
