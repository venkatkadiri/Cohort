{{/*
Expand the name of the chart.
*/}}
{{- define "transaction-hub.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "transaction-hub.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "transaction-hub.labels" -}}
helm.sh/chart: {{ include "transaction-hub.name" . }}-{{ .Chart.Version | replace "+" "_" }}
{{ include "transaction-hub.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "transaction-hub.selectorLabels" -}}
app.kubernetes.io/name: {{ include "transaction-hub.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app: transaction-hub
{{- end }}
