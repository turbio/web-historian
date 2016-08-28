(ns workers.core
  (:require [clj-http.client :as client])
  (:require [taoensso.carmine :as car :refer (wcar)]))

(client/get "http://example.com")

(def redis-server {:pool {} :spec {}})
(defmacro wcar* [& body] `(car/wcar redis-server ~@body))

(defn pending-tasks [] (wcar* (car/zrange "queue" 0 -1)))

(defn begin-task [task] (println (str "starting task for " task)))
(defn end-task [task result] (println (str
                                        "ending task for " task
                                        " with result " result)))

(defn -main [& args]
  (doseq [i (pending-tasks)]
    (begin-task i)
    (end-task i (client/get (str (if (not (re-find #"://" i)) "http://") i)))))

