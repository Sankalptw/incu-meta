import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { format } from "date-fns";

type Schedule = {
  _id: string;
  date: string;
  time: string;
  description: string;
  createdAt: string;
};

const StartupSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const token = localStorage.getItem("startup_token");
        const res = await axios.get("http://localhost:3000/api/user/my-schedules", {
          headers: { token },
        });
        setSchedules(res.data.schedules);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading schedules...</div>;
  }

  if (schedules.length === 0) {
    return <div className="flex justify-center items-center h-screen">No schedules found.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-6"
      >
        My Schedules
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedules.map((schedule) => (
          <motion.div
            key={schedule._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>{format(new Date(schedule.date), "dd MMM yyyy")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">🕒 {schedule.time}</p>
                <p>{schedule.description || "No description provided."}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StartupSchedules;
