#!/bin/sh
set -eu

mkdir -p target/classes target/test-classes
javac --release 17 -d target/classes \
  src/main/java/dev/forall/billing/domain/*.java \
  src/main/java/dev/forall/billing/application/*.java \
  src/main/java/dev/forall/billing/repository/*.java \
  src/main/java/dev/forall/billing/delivery/*.java
javac --release 17 -cp target/classes -d target/test-classes \
  src/test/java/dev/forall/billing/*.java
java -ea -cp target/classes:target/test-classes \
  dev.forall.billing.BillingEngineAssertions
