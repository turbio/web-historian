(ns workers.core
  (:require [clj-http.client :as client])
  (:require [taoensso.carmine :as car :refer (wcar)])
  (:require [clojure.core.async :as async
   :refer [>! <! >!! <!! go chan buffer close! thread alts! alts!! timeout]])
  (:require [net.cgrand.enlive-html :as html])
  (:require [clojure.data.json :as json]))

(def redis-server {:pool {} :spec {:host "10.6.27.196"}})
(defmacro wcar* [& body] `(car/wcar redis-server ~@body))

(def archive-path "./archive/")

(defn to-file-path
  [url]
  (-> url
    (clojure.string/replace "//" "/")
    (clojure.string/replace ":" "")))

(defn get-task
  []
  (println "poping from redis")
  (json/read-str (last (wcar* (car/blpop "pending" 0)))))

(defn send-task
  [task]
  (println "pushing to redis")
  (wcar* (car/lpush "done" (json/write-str task))))

(defn get-links
  [task]
  (println "adding links to")
  (merge
    task
    {"links"
     (mapcat
       #(html/attr-values % :href)
       (html/select (html/html-snippet (get task "result")) [:a]))}))

(defn save-file
  [task]
  (println "saving to file")
  (let [path (to-file-path (str archive-path (get task "url")))]
    (clojure.java.io/make-parents path)
    (spit path (get task "result"))))

(defn curl
  [task]
  (println "starting curl " (get task "url"))
  (merge
    task
    {"result"
     (try
       (get (client/get (get task "url")) :body)
       (catch Exception e (str e)))}))

(defn -main
  [& args]
  (println "listening...")
  (loop []
    (let [task (-> (get-task) (curl) (get-links))]
      ;(save-file task)
      (send-task task)
      (println "done!"))
    (recur)))
