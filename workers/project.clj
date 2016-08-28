(defproject workers "0.1.0-SNAPSHOT"
  :main workers.core
  :description "web historian worker"
  :url "whatisadojo.xyz"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [clj-http "2.2.0"]
                 [com.taoensso/carmine "2.14.0"]])
