package com.match.server.entities;

import java.sql.Timestamp;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class UserTime {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn
    private Team team;

    @Column
    private Timestamp currtime;

    @Column
    private Type type;

    public UserTime(Team team, Timestamp timestamp, Type type) {
        this.team = team;
        this.currtime = timestamp;
        this.type = type;
    }

    public UserTime() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public Timestamp getTimestamp() {
        return currtime;
    }

    public void setTimestamp(Timestamp timestamp) {
        this.currtime = timestamp;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public enum Type {
        START,
        PAUSE,
        RESUME,
        FINISH
    }
}
