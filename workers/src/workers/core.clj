(ns workers.core
  (:require [clj-http.client :as client])
  (:require [taoensso.carmine :as car :refer (wcar)])
  (:require [clojure.core.async :as async
   :refer [>! <! >!! <!! go chan buffer close! thread alts! alts!! timeout]])
  (:require [net.cgrand.enlive-html :as html]))

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
  (last (wcar* (car/blpop "pending" 0))))

(defn get-links
  [text]
  (mapcat
    #(html/attr-values % :href)
    (html/select (html/html-snippet text) [:a])))

(defn post-task
  [task, result]
  (println (str "finished " task))
  (let [path (to-file-path (str archive-path task))]
    (clojure.java.io/make-parents path)
    (spit path result))
  (println (for [x (get-links result)]
    (if (= (get x 0) \/) (str task x) x)
  ))
)

(defn add-proto
  [url]
  (str (if (not (re-find #"://" url)) "http://") url))

(defn curl
  [task]
  (println (str "starting curl " task))
  (post-task
    task
    (try
      (get (client/get task) :body) (catch Exception e (str e)))))

(defn -main
  [& args]
  (println "listening...")
  (loop
    []
    (curl (add-proto (get-task)))
    (recur)))
