(ns workers.core
  (:require [clj-http.client :as client])
  (:require [taoensso.carmine :as car :refer (wcar)])
  (:require [clojure.core.async :as async
   :refer [>! <! >!! <!! go chan buffer close! thread alts! alts!! timeout]])
  (:require [net.cgrand.enlive-html :as html])
  (:require [clojure.data.json :as json]))

(def redis-server {:pool {} :spec {}})
(defmacro wcar* [& body] `(car/wcar redis-server ~@body))

(def archive-path "./archive/")

(defn to-file-path
  [url]
  (-> url
    (clojure.string/replace "//" "/")
    (clojure.string/replace ":" "")))

(defn get-task
  []
  (json/read-str (last (wcar* (car/blpop "pending" 0)))))

(defn send-task
  [task]
  (println "sending to redis ")
  (wcar* (car/lpush "done" (json/write-str task))))

(defn check-host
  [host url]
  (if (= (get url 0) \/)
    (str host url)
    url))

(defn get-links
  [task]
  (println "adding links to ")
  (merge
    task
    {"links"
     (mapcat
       #(html/attr-values % :href)
       (html/select (html/html-snippet (get task "result")) [:a]))}))

(defn save-file
  [task]
  (println "saving to file ")
  (let [path (to-file-path (str archive-path (get task "url")))]
    (clojure.java.io/make-parents path)
    (spit path (get task "result"))))

(defn add-proto
  [task]
  (println "checking protocol ")
  (merge task
    {"url" (let
       [url (get task "url")]
       (str
         (if (not (re-find #"://" url)) "http://")
         url))}))

(defn curl
  [task]
  (println "starting curl ")
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
    (let [task (-> (get-task) (add-proto) (curl) (get-links))]
      (save-file task)
      (send-task task)
      (println "done!"))
    (recur)))
