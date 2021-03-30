# mc.pkr.hcl
# packer template for building a virtual machine image for running the Mission Command server

source "qemu" "mc" {
  iso_url           = "https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-10.9.0-amd64-netinst.iso"
  iso_checksum      = "none"
  output_directory  = "output_centos_tdhtest"
  shutdown_command  = "echo 'packer' | sudo -S shutdown -P now"
  cpus              = "1"
  disk_size         = "5000M"
  memory            = "1024"
  format            = "qcow2"
  accelerator       = "kvm"
  http_directory    = "."
  ssh_username      = "root"
  ssh_password      = "s0m3password"
  ssh_timeout       = "20m"
  vm_name           = "tdhtest"
  net_device        = "virtio-net"
  disk_interface    = "virtio"
  boot_wait         = "10s"
  boot_command      = ["<esc>auto url=http://{{ .HTTPIP }}:{{ .HTTPPort }}/Debian-10-preseed.txt<enter>"]
}

build {
  sources = ["source.qemu.mc"]
}