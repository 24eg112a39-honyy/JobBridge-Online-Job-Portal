package com.jobbridge.backend.controller;

import com.jobbridge.backend.model.Job;
import com.jobbridge.backend.model.JobApplication;
import com.jobbridge.backend.repository.JobRepository;
import com.jobbridge.backend.repository.JobApplicationRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final JobRepository jobRepository;
    private final JobApplicationRepository applicationRepository;

    @Value("${jobbridge.admin.username}")
    private String adminUsername;

    @Value("${jobbridge.admin.password}")
    private String adminPassword;

    public AdminController(
            JobRepository jobRepository,
            JobApplicationRepository applicationRepository) {

        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
    }

    // =========================
    // ADMIN LOGIN
    // =========================

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginData) {

        String username = loginData.get("username");
        String password = loginData.get("password");

        Map<String, Object> response = new HashMap<>();

        if (adminUsername.equals(username) &&
            adminPassword.equals(password)) {

            response.put("success", true);
            response.put("message", "Login successful");

        } else {

            response.put("success", false);
            response.put("message", "Invalid username or password");
        }

        return response;
    }


    // =========================
    // GET ALL JOBS
    // =========================

    @GetMapping("/jobs")
    public List<Job> getJobs() {

        return jobRepository.findAll();
    }


    // =========================
    // GET ALL APPLICATIONS
    // =========================

    @GetMapping("/applications")
    public List<JobApplication> getApplications() {

        return applicationRepository.findAll();
    }
}