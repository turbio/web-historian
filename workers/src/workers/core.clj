(ns workers.core
  (:require [clj-http.client :as client])
  (:require [taoensso.carmine :as car :refer (wcar)]))

(def redis-server {:pool {} :spec {}})
(defmacro wcar* [& body] `(car/wcar redis-server ~@body))

(defn get-task
  []
  (last (wcar* (car/blpop "pending" 0))))

(defn curl
  [task]
  (println (str "starting task for " task)))

(defn -main
  [& args]
  (loop
    []
    (curl (get-task))
    (recur)))

