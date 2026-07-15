import React, { useState, useEffect } from "react";
import { Play, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function EnrollButton({ level }) {
  const [user, setUser] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkStatus();
  }, [level?.id]);

  const checkStatus = async () => {
    setChecking(true);
    const authed = await base44.auth.isAuthenticated();
    if (!authed) { setChecking(false); return; }
    const me = await base44.auth.me();
    setUser(me);
    // Find published course matching this level
    const courses = await base44.entities.Course.filter({ level: level.id, is_published: true });
    if (courses.length > 0) {
      const envs = await base44.entities.CourseEnrollment.filter({ user_id: me.id, course_id: courses[0].id });
      setEnrollment(envs[0] || null);
    }
    setChecking(false);
  };

  const handleEnroll = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }
    setLoading(true);
    // Get or find the published course for this level
    const courses = await base44.entities.Course.filter({ level: level.id, is_published: true });
    if (courses.length === 0) {
      toast.error("This course is not yet available. Please check back soon.");
      setLoading(false);
      return;
    }
    const course = courses[0];
    const existing = await base44.entities.CourseEnrollment.filter({ user_id: user.id, course_id: course.id });
    if (existing.length > 0) {
      navigate("/student-dashboard");
      setLoading(false);
      return;
    }
    // Navigate to checkout with course ID as URL parameter
    navigate(`/checkout?courseId=${course.id}`);
    setLoading(false);
  };

  if (checking) return null;

  if (enrollment) {
    return (
      <Link to="/student-dashboard">
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-display py-5 gap-2">
          <Play className="w-4 h-4" />
          {enrollment.progress_percent > 0 ? `Continue — ${enrollment.progress_percent}% complete` : "Start Learning"}
        </Button>
      </Link>
    );
  }

  if (!user) {
    return (
      <Button
        onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
        className="w-full bg-harvest hover:bg-harvest/90 text-white font-display py-5 gap-2"
      >
        <LogIn className="w-4 h-4" /> Sign In to Enrol — ${level.price}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleEnroll}
      disabled={loading}
      className="w-full bg-harvest hover:bg-harvest/90 text-white font-display py-5 gap-2"
    >
      {loading ? "Enrolling…" : `Enrol Now — $${level.price}`}
    </Button>
  );
}